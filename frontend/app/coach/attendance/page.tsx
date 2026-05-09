import RoleDashboard from '../../../components/RoleDashboard';
import { permissions } from '../../../lib/permissions';

export default function Page() {
  return <RoleDashboard role="coach" title="Mark Attendance" section="Operational access" requiredPermission={permissions.attendanceRead} />;
}
