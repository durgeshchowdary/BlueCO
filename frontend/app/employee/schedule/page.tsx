import RoleDashboard from '../../../components/RoleDashboard';
import { permissions } from '../../../lib/permissions';

export default function Page() {
  return <RoleDashboard role="employee" title="Work Schedule" section="Assigned shifts" requiredPermission={permissions.scheduleRead} />;
}
