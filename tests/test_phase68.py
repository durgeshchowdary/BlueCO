import json
import os
import pathlib
import subprocess


ROOT = pathlib.Path(__file__).resolve().parents[1]


def run_node(source, env=None):
    result = subprocess.run(
        ["node", "-e", source],
        cwd=ROOT,
        text=True,
        capture_output=True,
        env={**os.environ, **(env or {})},
        check=True,
    )
    return result.stdout.strip()


def test_upload_success_validation_accepts_allowed_document():
    output = run_node(
        """
        const svc = require('./backend/services/complianceService');
        const result = svc.validateUploadPayload({
          fileName: 'pe-registration.pdf',
          size: 12,
          contentBase64: Buffer.from('valid payload').toString('base64')
        });
        console.log(JSON.stringify({ extension: result.extension, size: result.buffer.length }));
        """
    )
    assert json.loads(output) == {"extension": "pdf", "size": 13}


def test_extension_validation_rejects_unapproved_types():
    output = run_node(
        """
        const svc = require('./backend/services/complianceService');
        try {
          svc.validateUploadPayload({ fileName: 'malware.exe', size: 4, contentBase64: 'dGVzdA==' });
        } catch (error) {
          console.log(JSON.stringify({ code: error.code, status: error.status }));
        }
        """
    )
    assert json.loads(output) == {"code": "INVALID_EXTENSION", "status": 400}


def test_rejects_files_larger_than_five_mb():
    output = run_node(
        """
        const svc = require('./backend/services/complianceService');
        try {
          svc.validateUploadPayload({ fileName: 'large.pdf', size: svc.MAX_FILE_SIZE + 1, contentBase64: 'dGVzdA==' });
        } catch (error) {
          console.log(JSON.stringify({ code: error.code, status: error.status }));
        }
        """
    )
    assert json.loads(output) == {"code": "FILE_TOO_LARGE", "status": 413}


def test_rejects_empty_file_payloads():
    output = run_node(
        """
        const svc = require('./backend/services/complianceService');
        try {
          svc.validateUploadPayload({ fileName: 'empty.pdf', size: 0, contentBase64: '' });
        } catch (error) {
          console.log(JSON.stringify({ code: error.code, status: error.status }));
        }
        """
    )
    assert json.loads(output) == {"code": "EMPTY_FILE", "status": 400}


def test_storage_retry_behavior_writes_after_initial_failure(tmp_path):
    upload_root = tmp_path / "dlt"
    output = run_node(
        """
        const fs = require('fs');
        const svc = require('./backend/services/complianceService');
        let attempts = 0;
        const original = fs.promises.writeFile;
        fs.promises.writeFile = async (...args) => {
          attempts += 1;
          if (attempts === 1) throw new Error('transient');
          return original(...args);
        };
        svc.writeFileWithRetry('academy-a/retry.pdf', Buffer.from('ok'), 2)
          .then((target) => console.log(JSON.stringify({ attempts, exists: fs.existsSync(target) })));
        """,
        env={"DLT_UPLOAD_DIR": str(upload_root)},
    )
    assert json.loads(output.splitlines()[-1]) == {"attempts": 2, "exists": True}


def test_storage_failure_fallback_is_exposed_as_503_response():
    route_source = (ROOT / "backend/routes/academyRoutes.js").read_text()
    assert "STORAGE_FAILURE" in route_source
    assert "res.status(503)" in route_source


def test_missing_jwt_is_enforced_before_compliance_routes():
    academy_routes = (ROOT / "backend/routes/academyRoutes.js").read_text()
    super_admin_routes = (ROOT / "backend/routes/superAdminRoutes.js").read_text()
    auth_middleware = (ROOT / "backend/middleware/authMiddleware.js").read_text()

    assert "router.use(authenticateUser" in academy_routes
    assert "router.use(authenticateUser, requireSuperAdmin())" in super_admin_routes
    assert "Authentication required" in auth_middleware


def test_soft_delete_marks_document_without_removing_academy_record():
    route_source = (ROOT / "backend/routes/academyRoutes.js").read_text()
    assert "deletedAt" in route_source
    assert "deletedBy" in route_source
    assert "findByIdAndUpdate" in route_source
    assert "findByIdAndDelete" not in route_source.split("router.delete('/compliance/dlt-documents/:docType'")[1].split("router.get('/employees'")[0]


def test_queue_filtering_and_search_are_backend_driven():
    route_source = (ROOT / "backend/routes/superAdminRoutes.js").read_text()
    assert "router.get('/compliance'" in route_source
    assert "['complete', 'partial', 'pending'].includes(status)" in route_source
    assert "row.complianceStatus === status" in route_source
    assert "toLowerCase().includes(search)" in route_source


def test_compliance_status_pivot_rules():
    output = run_node(
        """
        const svc = require('./backend/services/complianceService');
        const uploaded = { storageKey: 'x', uploadedAt: new Date(), deletedAt: null };
        const deleted = { storageKey: 'x', uploadedAt: new Date(), deletedAt: new Date() };
        console.log(JSON.stringify([
          svc.complianceStatusForDocs({ registration: uploaded, authorization: uploaded }),
          svc.complianceStatusForDocs({ registration: uploaded, authorization: {} }),
          svc.complianceStatusForDocs({ registration: deleted, authorization: {} })
        ]));
        """
    )
    assert json.loads(output) == ["complete", "partial", "pending"]
