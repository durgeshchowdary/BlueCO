import RoleDashboard from '../../../components/RoleDashboard';
import { permissions } from '../../../lib/permissions';

export default function Page() {
  return <RoleDashboard role="employee" title="Support Tickets" section="Support staff access" requiredPermission={permissions.ticketsRead} />;
}
