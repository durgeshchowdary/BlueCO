import RoleDashboard from '../../../components/RoleDashboard';
import { permissions } from '../../../lib/permissions';

export default function Page() {
  return <RoleDashboard role="employee" title="Admissions Desk" section="Reception access" requiredPermission={permissions.admissionsRead} />;
}
