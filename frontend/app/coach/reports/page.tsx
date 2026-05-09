import RoleDashboard from '../../../components/RoleDashboard';
import { permissions } from '../../../lib/permissions';

export default function Page() {
  return <RoleDashboard role="coach" title="Coach Reports" section="Assigned players only" requiredPermission={permissions.reportsRead} />;
}
