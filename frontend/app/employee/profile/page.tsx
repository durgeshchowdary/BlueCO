import RoleDashboard from '../../../components/RoleDashboard';
import { permissions } from '../../../lib/permissions';

export default function Page() {
  return <RoleDashboard role="employee" title="Employee Profile" section="Self service" requiredPermission={permissions.profileRead} />;
}
