import RoleDashboard from '../../../components/RoleDashboard';
import { permissions } from '../../../lib/permissions';

export default function Page() {
  return <RoleDashboard role="employee" title="Assigned Tasks" section="Own work only" requiredPermission={permissions.tasksRead} />;
}
