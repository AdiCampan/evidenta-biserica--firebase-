import './Grafice.scss';
import DatePicker from 'react-datepicker';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { useGetMembersQuery } from '../services/members';
import { useState } from 'react';
import { calculateAge, formatDate, filterByText } from '../utils'
import { Typeahead } from 'react-bootstrap-typeahead';
import { Table } from 'react-bootstrap';


function Grafice() {

  const { data: persoane, error, isLoading, isFetching } = useGetMembersQuery();
  const [nrMembrii, setNrMembrii] = useState([]);
  const [ageFilter, setAgeFilter] = useState("18")
  const [startDate, setStartDate] = useState(new Date((new Date().getFullYear() - 10).toString()));
  const [endDate, setEndDate] = useState(new Date());
  const totalMembrii = persoane?.filter(p => p.memberDate).length;
  const date = new Date().toDateString();

  const totalFamilii = persoane ? filterFamilys(persoane).length : null;
  const familii = persoane ? filterFamilys(persoane) : null;
  const familii1 = familii?.map(p => p.relation === 'child')

  console.log(familii1);

  const nrBarbati = persoane?.filter(p => p.sex == true && p.memberDate && (calculateAge(p.birthDate) >= 18)).length;
  const nrFemei = persoane?.filter(p => p.sex == false && p.memberDate && (calculateAge(p.birthDate) >= 18)).length;
  const nrCopii = persoane?.filter(p =>
    (calculateAge(p.birthDate)) < 18 &&
    (relation => relation.type === "child")).length;
  const nrCopiiMajoriNebotezati = persoane?.filter(p =>
    (calculateAge(p.birthDate)) >= 18 &&
    (relation => relation.type === 'child') &&
    (p.memberDate === null)).length;
  const nrMembriiFilter = persoane?.filter(p => (calculateAge(p.birthDate)) > parseInt(ageFilter)).length;

  function filterFamilys(members) {
    let filteredFamilys = members;
    filteredFamilys = filteredFamilys.filter(member => member.relations.find(relation => relation.type === 'wife'));
    filteredFamilys = filteredFamilys.filter(person => person.sex === true);
    return filteredFamilys;
  }


  const getMemberHistoryYears = () => {
    const years = getYearsFromInterval(startDate.getFullYear(), endDate.getFullYear());
    return years;
  }

  const getYearsFromInterval = (from, to) => {
    const listOfYears = [];
    for (let year = from; year <= to; year++) {
      listOfYears.push(year);
    }
    return listOfYears;
  }

  const getMemberHistory = () => {
    const membersByYears = [];
    const years = getMemberHistoryYears();
    for (let i = 0; i < years.length; i++) {
      const personsByYear = persoane?.filter(p => {
        if (p.memberDate && new Date(p.memberDate).getFullYear() <= years[i]) {
          // if (p.leaveDate &&  new Date(p.leaveDate).getFullYear() > years[i]) {
          // 	return true;
          // } else if (!p.leaveDate) {
          return true;
          // }
        }
        return false;
      }).length;
      membersByYears.push(personsByYear);
    }
    return membersByYears;
  }

  const getChildrensHistory = () => {
    const childrenByYears = [];
    const years = getMemberHistoryYears();
    for (let i = 0; i < years.length; i++) {
      const personsByYear = persoane?.filter(p => {
        if (new Date(p.birthDate).getFullYear() <= years[i]) {
          return true;
        }
        return false;
      }).length;
      childrenByYears.push(personsByYear);
    }
    return childrenByYears;
  }

  return (
    <>
      <div className='container-principal'>
        <div className='chart'>
          <Pie data={{
            labels: ['Barbati', 'Femei'],
            datasets: [
              {
                data: [nrBarbati, nrFemei],
                backgroundColor: [
                  'rgba(54, 162, 235, 0.7)',
                  'rgba(255, 99, 132, 0.7)',
                ]
              }
            ]
          }}
            // width={300}
            // height={300}
            options={{ maintainAspectRatio: false }}
          />
        </div>
        <div className='chart'>
          <div>
          <p style={{ textAlign : "center" }}>EVOLUTIA  MEMBRILOR</p>
          <Line
            datasetIdKey='id345'
            data={{
              labels: getMemberHistoryYears(),
              datasets: [
                {
                  id: 1,
                  label: 'Nr.de membri',
                  data: getMemberHistory(),
                  backgroundColor: [
                    'rgba(54, 162, 235, 1.9)',
                  ]
                },
                // {
                //   id: 2,
                //   label: 'Nr.de copii',
                //   data: getMemberHistory(),
                //   backgroundColor: [
                //     'rgba(54, 162, 235, 1.9)',
                //   ]
                // }
              ],
            }}
          />
          </div>
          <div>
            <span>Alege perioada</span>
            <div className='period'>
              <p style={{ marginLeft: 12}}>Din:</p>
              
              <DatePicker
                className='date-picker'
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                maxDate={endDate}
                dateFormat="yyyy"
                showYearPicker
              // showMonthYearPicker
              /></div>
            <div className='period'>
              până:
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                maxDate={new Date()}
                dateFormat="yyyy"
                showYearPicker
              // showMonthYearPicker
              /></div>
          </div>
        </div>
        <div className='chart'>
          <Bar
            data={{
              labels: [''],
              datasets: [
                {
                  label: 'Barbati',
                  data: [nrBarbati],
                  backgroundColor: 'rgba(255, 99, 132, 0.7)',
                },
                {
                  label: 'Femei',
                  data: [nrFemei],
                  backgroundColor: 'rgba(53, 162, 235, 0.7)',
                },
              ],
            }}
          />
        </div>
        <div className='chart'>
          <p>RAPORT PE VÂRSTĂ</p>
          <div className='total-text'>
            <p>Total Membrii la {formatDate(date)}: <span style={{ fontWeight: 'bolder', marginLeft: '5px' }}>{totalMembrii}</span></p>
          </div>
          <div className='age-filter-over'>
            <p>Membrii peste
              <input
                className="age-input"
                type="number"
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)} />
              ani:
            </p>
            <p style={{ fontWeight: 'bolder', marginLeft: '10px' }}>{nrMembriiFilter}</p>
          </div>

        </div>
        <div className='chart'>
          <p>EVOLUTIA COPIILOR</p>
          <Line
            datasetIdKey='id345'
            data={{
              labels: getMemberHistoryYears(),
              datasets: [
                {
                  id: 2,
                  label: 'Nr.de copii',
                  data: getChildrensHistory(),
                  backgroundColor: [
                    'rgba(54, 162, 235, 1.9)',
                  ]
                }
              ],
            }}
          />
        </div>
        <div className='chart'>
          <p>RAPORT COPII</p>
          <p>Copii minori care nu sunt membrii {nrCopii}</p>
          <p>Copii majori care nu sunt membrii {nrCopiiMajoriNebotezati}</p>
        </div>
        <div className='chart'>
          <p>RAPORT FAMILII</p>
          Total familii:{totalFamilii}
          <Table>
            <thead>
              <tr>
                <th>Index</th>
                <th>Familii</th>
                <th>Copii</th>
              </tr>

            </thead>
            <tbody>
              {persoane ? filterFamilys(persoane).map((p, index) => (
                <tr key={p.id} >
                  <td>{index + 1}</td>
                </tr>
              )) : null}
            </tbody>
          </Table>
        </div>
        <div className='chart'></div>
        <div className='chart'></div>
      </div>
    </>
  )
}
export default Grafice;