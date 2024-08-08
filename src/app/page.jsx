'use client'

import React, { useState } from "react"

export default function Home() {
  const [proxyData, setProxyData] = useState()

  const handToFetchProxy = async () => {

    try {

      const fetchy = await fetch(`/api/proxy`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ mylimit: "30", myAfterLimit: "40" })
      })

      const fetchyResponse = await fetchy.json()

      console.log(fetchyResponse)
      setProxyData(fetchyResponse)

    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <main className="flex justify-center items-center min-w-full min-h-[100dvh]">
        <div className="divBg shadow p-2 lg:rounded-md lg:min-w-[795px] lg:h-[335px] flex flex-row bg-[#1e1e1e] border border-[#ffffff24]">

          <div className="p-4 w-[40%] bg-[#333333]"></div>

          <div className="p-4 w-full border-l border-l-[#3d3d3d] bg-[#333333]">
            <button
              onClick={() => {
                handToFetchProxy()
              }}
              className=" transition-all text-[#f3f3f3] lg:px-4 lg:py-2 text-[9.7px] rounded-[3px] active:bg-[#7b9a62a2] bg-[#7b9a62] hover:bg-[#7b9a62e1]">
              gen proxy
            </button>

            <div className="">

              {proxyData && <>
                <div className="break-words mt-2">

                  <span className="text-[9px]"> time taken : {proxyData?.timeTaken}</span>

                  <div className="overflow-y-scroll lg:h-[229px] mt-[4px]">

                    {proxyData?.test?.map((r) => (<>
                      <div className="flex flex-col p-2 mb-1 border border-[#ffffff24] bg-[#2f3134] text-[9.7px]">
                        <div className="">
                          ip : {r?.proxy}
                        </div>
                        <div className="">
                          country : {r?.proxy_loacation?.country}
                        </div>
                        <div className="">
                          countryCode : {r?.proxy_loacation?.region}
                        </div>
                        <div className="">
                          region : {r?.proxy_loacation?.region}
                        </div>
                        <div className="">
                          regionName : {r?.proxy_loacation?.regionName}
                        </div>
                        <div className="">
                          city : {r?.proxy_loacation?.city}
                        </div>
                        <div className="">
                          zip : {r?.proxy_loacation?.zip}
                        </div>
                        <div className="">
                          lat : {r?.proxy_loacation?.lat}
                        </div>
                        <div className="">
                          lon : {r?.proxy_loacation?.lon}
                        </div>
                        <div className="">
                          timezone : {r?.proxy_loacation?.timezone}
                        </div>
                        <div className="">
                          isp : {r?.proxy_loacation?.isp}
                        </div>
                        <div className="">
                          org : {r?.proxy_loacation?.org}
                        </div>
                        <div className="">
                          as : {r?.proxy_loacation?.as}
                        </div>
                        <div className="">
                          query : {r?.proxy_loacation?.query}
                        </div>
                      </div>
                    </>))}

                  </div>

                </div>
              </>}


            </div>
          </div>

        </div>
      </main>
    </>
  );
}
