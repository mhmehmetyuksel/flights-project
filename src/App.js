import { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {

  const getData = async () => {
    const airportsUrl = new URL('https://64e6451d09e64530d17fcfcf.mockapi.io/api/airports');
    const flightsUrl = new URL('https://64e6451d09e64530d17fcfcf.mockapi.io/api/flight');
    flightsUrl.searchParams.append('sortBy', 'price');
    flightsUrl.searchParams.append('order', 'desc');
    let { data: flightsData } = await axios.get(flightsUrl)
    let { data: airportsData } = await axios.get(airportsUrl)
    setData({ flights: flightsData, airports: airportsData, loading: false })
  }

  const [filters, setFilters] = useState({})
  const [data, setData] = useState({ flights: [], airports: [], loading: true })
  const [oneWay, setOneWay] = useState(false)

  const handleChange = (event) => {
    let name = event.target.name;
    let value = event.target.value;
    if (name === 'departureDate' || name === 'arrivalDate') value = value.split('-').reverse().join('/')
    setFilters(values => ({ ...values, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (oneWay) delete filters.to
    setData({ ...data, loading: true })
    const url = new URL('https://64e6451d09e64530d17fcfcf.mockapi.io/api/flight');
    for (let key in filters) {
      (filters[key] && key !== 'sort') && url.searchParams.append(key, filters[key])
      if (filters[key] && key === 'sort') {
        url.searchParams.append('sortBy', filters[key].split('-')[0]);
        url.searchParams.append('order', filters[key].split('-')[1]);
      }
    }
    let { data: flightsData } = await axios.get(url, {
      headers: { 'content-type': 'application/json' }
    })

    let filtered = flightsData.filter((flight) => {
      for (let key in filters) {
        if (key === 'sort') continue;
        if (!flight[key].includes(filters[key])) {
          return false
        }
      }
      return true
    })
    setData({ ...data, flights: filtered, loading: false })
  }

  useEffect(() => {
    getData()
  }, [])

  const handleCheckbox = (e) => {
    setOneWay(e.target.checked)
  }

  return (
    <div className="app">
      <div className='container'>
        <form onSubmit={handleSubmit} className='bg-yellow-500 mb-3 rounded-md p-3'>
          <div className='flex justify-between'>
            <div>
              <label className='text-lg'>From: <br />
                <select name="from" className='h-10 text-black rounded-md w-fit px-1 text-lg' onChange={handleChange}>
                  <option value=""> Şehir Seçiniz </option>
                  {data.airports.map((airport) => <option value={airport.name}>{airport.city} - {airport.name}</option>)}
                </select>
              </label></div>
            <div>
              <label className='text-lg'>To: <br />
                <select name="to" className={`h-10 text-black rounded-md w-fit px-1 text-lg ${oneWay ? 'cursor-not-allowed' : ''}`} onChange={handleChange} disabled={oneWay}>
                  <option value=""> Şehir Seçiniz </option>
                  {data.airports.map((airport) => <option value={airport.name}>{airport.city} - {airport.name}</option>)}
                </select>
              </label>
            </div>
            <div>
              <label className='text-lg'>Sort:</label> <br />
              <select name="sort" className='h-10 text-black rounded-md w-52 px-1 text-lg' onChange={handleChange}>
                <option value="price-desc" className='text-lg'>To Lower Price</option>
                <option value="price-asc" className='text-lg'>To Higher Price</option>
                <option value="durationInMinutes-desc" className='text-lg'>To Shortest Flights</option>
                <option value="durationInMinutes-asc" className='text-lg'>To Longest Flights</option>
                <option value="departureTime-desc" className='text-lg'>To Latest Departure</option>
                <option value="departureTime-asc" className='text-lg'>To Earliest Departure</option>
                <option value="arrivalTime-desc" className='text-lg'>To Latest Arrival</option>
                <option value="arrivalTime-asc" className='text-lg'>To Earliest Arrival</option>
              </select>
            </div>
            <div>
              <label className='text-lg'>Departure/Arrive:</label> <br />
              <input onChange={handleChange} className='h-10 text-black rounded-md w-52 px-1 text-lg mr-2' name="departureDate" type="date" />
              <input onChange={handleChange} className='h-10 text-black rounded-md w-52 px-1 text-lg' name="arrivalDate" type="date" />
            </div>
          </div>
          <div className='flex justify-between mt-3'>
            <label className='text-lg flex items-center'>
              One Way
              <input type='checkbox' onChange={handleCheckbox} className='mr-3 ml-1 h-4 w-4' />
            </label>
            <div>
              <input type="reset" className='text-lg bg-gray-500 px-3 py-1 rounded-md' onClick={() => {
                setFilters([])
                getData()
              }} value="Reset" />
              <input type="submit" className='text-lg bg-red-500 px-3 py-1 rounded-md ml-2' value='Look for Flights' />
            </div>

          </div>

        </form>
        {data.flights?.length ? data.flights.map((flight) => <div className='h-fit bg-yellow-500 rounded-md px-7 py-3 mb-3 text-lg'>
          <div className='flex justify-between'><div>From:{flight.from}  To: {flight.to} </div> <div className='text-xl'>₺{flight.price}</div> </div>
          <div>Company: {flight.airlineBusiness}</div>
          <div className='flex justify-between'>
            <div>Departure: {flight.departureDate} / {flight.departureTime} </div>
            <div>Arrival: {flight.arrivalDate} / {flight.arrivalTime}</div>
            <div>Duration: {flight.durationInMinutes} mins.</div>
          </div>

        </div>) : <div>Uygun bir uçuş bulunamadı...</div>}
      </div>
    </div>
  );
}

export default App;
