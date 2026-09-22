import { WorkspaceNotificationsView } from "@/components/dashboard/StakeholderViews";
import { recruiterService } from "@/services/recruiter/recruiter.service";
export default function Page() { return <WorkspaceNotificationsView workspace="Recruiter" loader={recruiterService.getNotifications} />; }
