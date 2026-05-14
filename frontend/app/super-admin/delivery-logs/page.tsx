"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Send,
  Search,
  Eye,
} from "lucide-react";
import api from "../../../lib/api";

export default function DeliveryLogsPage() {

  const [logs,setLogs]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);

  const [tab,setTab]=useState("All");
  const [search,setSearch]=useState("");

  const loadLogs=async()=>{

    try{

      setLoading(true);

      const res=await api.get(
        "/super-admin/delivery-logs"
      );

      setLogs(
        res.data.logs||[]
      );

    }
    catch(err){
      console.log(err);
    }
    finally{
      setLoading(false);
    }

  };

  useEffect(()=>{

    loadLogs();

    const interval=setInterval(
      loadLogs,
      10000
    );

    return()=>clearInterval(
      interval
    );

  },[]);

  const filtered=useMemo(()=>{

    let data=[...logs];

    if(tab!=="All"){

      data=data.filter(
        item=>
        item.channel?.toLowerCase()
        ===tab.toLowerCase()
      );

    }

    if(search){

      const q=search.toLowerCase();

      data=data.filter(
        item=>

        item.recipient
        ?.toLowerCase()
        .includes(q)

        ||

        item.subject
        ?.toLowerCase()
        .includes(q)

      );

    }

    return data;

  },[
    logs,
    search,
    tab
  ]);

  const stats={

    sms:
    logs.filter(
      x=>x.channel==="SMS"
    ).length,

    whatsapp:
    logs.filter(
      x=>x.channel==="WhatsApp"
    ).length,

    email:
    logs.filter(
      x=>x.channel==="Email"
    ).length,

    sent:
    logs.filter(
      x=>x.status==="sent"
    ).length,

    errors:
    logs.filter(
      x=>x.status==="failed"
    ).length

  };

  return (

<div className="min-h-screen bg-[#fffdf0] p-6">

<div className="flex justify-between">

<div>

<h1 className="text-3xl font-black">
Delivery Logs
</h1>

<p className="text-[#64748b]">
Live communication activity
</p>

</div>

<button
onClick={loadLogs}
className="flex h-[42px] items-center gap-2 rounded-xl border bg-white px-4"
>

<RefreshCw size={16}/>

Refresh

</button>

</div>

<div className="mt-6 grid grid-cols-5 gap-4">

<Card
title="SMS"
value={stats.sms}
/>

<Card
title="WhatsApp"
value={stats.whatsapp}
/>

<Card
title="Email"
value={stats.email}
/>

<Card
title="Sent"
value={stats.sent}
/>

<Card
title="Errors"
value={stats.errors}
/>

</div>

<div className="mt-6 flex gap-3">

{[
"All",
"SMS",
"WhatsApp",
"Email"

].map(item=>(

<button
key={item}
onClick={()=>
setTab(item)
}
className={`px-4 py-2 rounded-xl
${
tab===item
?
"bg-white shadow"
:
"bg-[#ece8dc]"
}
`}
>

{item}

</button>

))}

<div className="relative flex-1">

<Search
size={16}
className="absolute left-4 top-4"
/>

<input
value={search}
onChange={(e)=>
setSearch(
e.target.value
)
}
placeholder="Search..."
className="w-full h-[44px] rounded-xl border bg-white pl-10"
/>

</div>

</div>

<div className="mt-6 rounded-xl border overflow-hidden">

<div className="grid grid-cols-6 bg-[#f7f7f7] p-4 font-bold">

<div>Channel</div>
<div>Recipient</div>
<div>Subject</div>
<div>Status</div>
<div>Route</div>
<div>Time</div>

</div>

{loading ?

<div className="p-6">
Loading...
</div>

:

filtered.map(log=>(

<div
key={log._id}
className="grid grid-cols-6 p-4 border-t bg-white"
>

<div>{log.channel}</div>

<div>
{log.recipient}
</div>

<div>
{log.subject}
</div>

<div>

<span
className={`
px-3 py-1 rounded-full text-xs

${
log.status==="sent"
?
"bg-green-100 text-green-700"
:
"bg-red-100 text-red-700"
}

`}
>

{log.status}

</span>

</div>

<div>
{log.route}
</div>

<div
className="flex justify-between"
>

{new Date(
log.createdAt
).toLocaleString()}

<Eye
size={16}
/>

</div>

</div>

))

}

</div>

</div>

);

}

function Card({

title,
value

}:any){

return(

<div
className="rounded-xl border bg-white p-5"
>

<p
className="text-sm text-gray-500"
>

{title}

</p>

<h2
className="text-3xl font-black mt-2"
>

{value}

</h2>

</div>

);

}