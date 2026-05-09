import RoleDashboard from '../../../components/RoleDashboard';
import { permissions } from '../../../lib/permissions';

export default function Page() {
  return <RoleDashboard role="employee" title="Reports Desk" section="Analyst access" requiredPermission={permissions.reportsRead} />;
}
