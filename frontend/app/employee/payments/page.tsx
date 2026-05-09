import RoleDashboard from '../../../components/RoleDashboard';
import { permissions } from '../../../lib/permissions';

export default function Page() {
  return <RoleDashboard role="employee" title="Payments Desk" section="Accountant access" requiredPermission={permissions.paymentsRead} />;
}
