import { createFileRoute } from '@tanstack/react-router';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { getInvitation } from '@/lib/invitation.functions';
import { InvitationPage } from '@/components/InvitationPage';
import { invitationHead, InvitationUnavailable, InvitationSkeleton } from '@/components/InvitationStates';
const options=(slug:string)=>queryOptions({queryKey:['invitation',slug],queryFn:()=>getInvitation({data:{slug}})});
export const Route=createFileRoute('/$slug')({loader:({context,params})=>context.queryClient.ensureQueryData(options(params.slug)),head:({loaderData})=>invitationHead(loaderData),component:SlugPage,pendingComponent:InvitationSkeleton,errorComponent:InvitationUnavailable,notFoundComponent:InvitationUnavailable});
function SlugPage(){const {slug}=Route.useParams();const {data}=useSuspenseQuery(options(slug));return data?<InvitationPage invitation={data}/>:<InvitationUnavailable/>;}