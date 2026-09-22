import { WorkspaceNotificationsView } from "@/components/dashboard/StakeholderViews";
import { institutionService } from "@/services/institution/institution.service";
export default function Page() { return <WorkspaceNotificationsView workspace="Institution" loader={institutionService.getNotifications} />; }
