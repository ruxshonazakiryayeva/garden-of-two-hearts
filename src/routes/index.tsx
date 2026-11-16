import { createFileRoute } from '@tanstack/react-router';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { getInvitation } from '@/lib/invitation.functions';
import { InvitationPage } from '@/components/InvitationPage';
import { invitationHead, InvitationUnavailable, InvitationSkeleton } from '@/components/InvitationStates';
const options=queryOptions({queryKey:['invitation','sacred-garden'],queryFn:()=>getInvitation({data:{slug:'sacred-garden'}})});
export const Route=createFileRoute('/')({loader:({context})=>context.queryClient.ensureQueryData(options),head:({loaderData})=>invitationHead(loaderData),component:Index,pendingComponent:InvitationSkeleton,errorComponent:InvitationUnavailable,notFoundComponent:InvitationUnavailable});
function Index(){const {data}=useSuspenseQuery(options);return data?<InvitationPage invitation={data}/>:<InvitationUnavailable/>;}
