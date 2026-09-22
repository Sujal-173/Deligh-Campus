import { TrainerAssessmentDetailView } from "@/components/dashboard/trainer/TrainerExtraViews";
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <TrainerAssessmentDetailView assessmentId={id}/>;}
