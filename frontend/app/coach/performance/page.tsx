import RoleDashboard from '../../../components/RoleDashboard';
import { permissions } from '../../../lib/permissions';

export default function Page() {
  return <RoleDashboard role="coach" title="Performance Reports" section="Player development" requiredPermission={permissions.performanceWrite} />;
}
