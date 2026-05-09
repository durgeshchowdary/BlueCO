import RoleDashboard from '../../../components/RoleDashboard';
import { permissions } from '../../../lib/permissions';

export default function Page() {
  return <RoleDashboard role="coach" title="Assigned Batches" section="Coach scope only" requiredPermission={permissions.batchesRead} />;
}
