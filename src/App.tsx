import { useEffect, useState } from 'react'
import './App.css'

type Data = {
  success: boolean
  data: {
    key: string
    name: string
    rate: number
    decimal: number
  }[]
}

type CacheData = {
  time: number
  dollar: number
}

const App = () => {
  // using cached value for dollar and rial
  const cached = localStorage.getItem("currentDollar")
  const [dollarPerToman, setDollarPerToman] = useState(() => {
    if (cached) {
      const cachedData: CacheData = JSON.parse(cached)
      return cachedData.dollar
    } else {
      return 0
    }
  })

  const [dollar, setDollar] = useState<number>(1)

  const [rial, setRial] = useState<number | "">(() => {
    if (cached) {
      const cachedData: CacheData = JSON.parse(cached)
      return cachedData.dollar * 10
    } else { 
      return ""
    }
  })

  useEffect(() => {
    const getDollarPrice = async (showAlert: boolean) => {
      // getting new dollar value
      const response = await fetch(
        "https://tindex.app/api/public/currency-rates",
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
            Accept: "application/json",
          },
        }
      );
      const data: Data = await response.json();
      const newPrice: number = data.data.find((item) => item.key === "usd-exchange-rate")!.rate
      setDollarPerToman(newPrice)
      setRial(newPrice * 10)
      setDollar(1)

      // caching time of request and dollar value
      const cache: CacheData = {
        time: Date.now(),
        dollar: newPrice
      }
      localStorage.setItem("currentDollar", JSON.stringify(cache))
      if (showAlert) { 
        alert("قیمت دلار به روز شد")
      }
      // getting new dollar value after 5 minutes 
      timeout = setTimeout(() => getDollarPrice(true), 5 * 60 * 1000)
    };

    let timeout: ReturnType<typeof setTimeout>

    // checking if there is a cached value or not
    if (localStorage.getItem("currentDollar")) {
      const cachedData: CacheData = JSON.parse(localStorage.getItem("currentDollar")!)
      // checking if has it been 5 minutes from last time(used when site is refreshed)
      if (Date.now() - cachedData.time < 5 * 60 * 1000) {
        const timeRemain = (5 * 60 * 1000) - (Date.now() - cachedData.time)
        // putting timeout for the remainig time of 5 minutes from last request
        timeout = setTimeout(() => getDollarPrice(true), timeRemain)
      } else {
        // it has been more than 5 minutes
        getDollarPrice(false)
      }
    } else { 
      // there is no cache
      getDollarPrice(false)
    }
    return () => {
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div className='flex justify-center items-center w-screen h-screen'>
      <main className="bg-[#FFFFFF] py-9 w-75 h-auto rounded-2xl text-center border border-[#E2E8F0] shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:w-[90%] sm:max-w-190">
        <h1 className="m-0 mb-8 text-2xl">مبدل ریال به دلار</h1>
        <div className="flex flex-col w-fit gap-5 m-auto sm:flex-row sm:justify-center sm:gap-12 md:gap-20">
          <div>
            <label className="block text-start text-lg mr-2.5 mb-1 text-[#64748B] sm:ml-1.25 sm:mr-0 sm:inline" htmlFor='rialID'>ریال</label>
            <input className="w-55 sm:w-45 md:w-55 px-4 py-3 border border-[#E2E8F0] rounded-[20px] bg-white outline-none focus:border-[#2563EB]" dir="ltr" id='rialID' type='number' value={rial} onChange={(e) => {
              setRial(Number(e.target.value))
              setDollar(Number(e.target.value) / (dollarPerToman * 10))
            }} />
          </div>
          <div>
            <label className="block text-start text-lg mr-2.5 mb-1 text-[#64748B] sm:ml-1.25 sm:mr-0 sm:inline" htmlFor='dollarID'>دلار</label>
            <input className="w-55 sm:w-45 md:w-55 px-4 py-3 border border-[#E2E8F0] rounded-[20px] bg-white outline-none focus:border-[#2563EB]" dir="ltr" id='dollarID' type='number' value={dollar} onChange={(e) => {
              setDollar(Number(e.target.value))
              setRial(Number(e.target.value) * (dollarPerToman * 10))
            }} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
