import "./Grafice.scss";
import DatePicker from "react-datepicker";
import { Line, Bar, Pie } from "react-chartjs-2";
import { useGetMembersQuery } from "../services/members";
import { useEffect, useState } from "react";
import { calculateAge, formatDate, filterByText } from "../utils";
import { Typeahead } from "react-bootstrap-typeahead";
import { Table } from "react-bootstrap";
import { collection, onSnapshot, query } from "firebase/firestore";
import { firestore } from "../firebase-config";

function Grafice({ persoane }) {
  // const [persoane, setPersoane] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // const q = query(collection(firestore, "persoane"));
  // useEffect(() => {
  //   onSnapshot(q, (querySnapshot) => {
  //     const tmpArray = [];
  //     querySnapshot.forEach((doc) => {
  //       const childKey = doc.id;
  //       const childData = doc.data();
  //       tmpArray.push({ id: childKey, ...childData });
  //       setPersoane(tmpArray);
  //     });
  //   });
  // }, []);

  const [nrMembrii, setNrMembrii] = useState([]);
  const [ageFilter, setAgeFilter] = useState("18");
  const [startDate, setStartDate] = useState(
    new Date((new Date().getFullYear() - 10).toString())
  );
  const [endDate, setEndDate] = useState(new Date());
  const totalMembrii =
    persoane.length > 0 && persoane?.filter((p) => p.memberDate).length;
  const date = new Date();

  // const totalFamilii = persoane ? filterFamilys(persoane).length : null;
  // const familii = persoane ? filterFamilys(persoane) : null;
  // const familii1 = familii?.map((p) => p.relation === "child");

  const nrBarbati =
    persoane.length > 0 &&
    persoane.filter(
      (p) => p.sex == true && p.memberDate && calculateAge(p.birthDate) >= 18
    ).length;
  const nrFemei =
    persoane.length > 0 &&
    persoane?.filter(
      (p) => p.sex == false && p.memberDate && calculateAge(p.birthDate) >= 18
    ).length;
  const nrCopii =
    persoane.length > 0 &&
    persoane?.filter(
      (p) =>
        calculateAge(p.birthDate) < 18 &&
        ((relation) => relation.type === "child")
    ).length;
  const nrCopiiMajoriNebotezati =
    persoane.length > 0 &&
    persoane?.filter(
      (p) =>
        calculateAge(p.birthDate) >= 18 &&
        ((relation) => relation.type === "child") &&
        p.memberDate === null
    ).length;
  const nrMembriiFilter =
    persoane.length > 0 &&
    persoane?.filter(
      (p) => calculateAge(p.birthDate) > parseInt(ageFilter) && p.memberDate
    ).length;

  // function filterFamilys(members) {
  //   if (members) {
  //     let filteredFamilys = members;
  //     const mans = filteredFamilys.filter((person) => person.sex === true);

  //     filteredFamilys = mans.filter((member) =>
  //       member.relations?.find((relation) => relation?.type === "wife")
  //     );
  //     return filteredFamilys;
  //   }
  // }

  const getMemberHistoryYears = () => {
    const years = getYearsFromInterval(
      startDate.getFullYear(),
      endDate.getFullYear()
    );
    return years;
  };

  const getYearsFromInterval = (from, to) => {
    const listOfYears = [];
    for (let year = from; year <= to; year++) {
      listOfYears.push(year);
    }

    return listOfYears;
  };

  const getMemberHistory = () => {
    const membersByYears = [];
    const years = getMemberHistoryYears();
    for (let i = 0; i < years.length; i++) {
      const personsByYear =
        persoane.length > 0 &&
        persoane?.filter((p) => {
          if (p.memberDate && p.memberDate.toDate().getFullYear() <= years[i]) {
            return true;
          }
          return false;
        }).length;
      membersByYears.push(personsByYear);
    }
    return membersByYears;
  };

  const getChildrensHistory = () => {
    const childrenByYears = [];
    const years = getMemberHistoryYears();
    for (let i = 0; i < years.length; i++) {
      const personsByYear =
        persoane.length > 0 &&
        persoane?.filter((p) => {
          if (
            calculateAge(p.birthDate) <= 18 &&
            p.birthDate?.toDate().getFullYear() <= years[i]
          ) {
            return true;
          }
          return false;
        }).length;
      childrenByYears.push(personsByYear);
    }
    return childrenByYears;
  };

  const filterFamilys = (persons) => {
    return Array.isArray(persons)
      ? persons.filter((person) =>
          person.relations?.some((relation) => relation.type === "wife")
        )
      : [];
  };

  const getNumberOfChildren = (relations) => {
    return relations.filter((relation) => relation.type === "child").length;
  };

  const totalFamilii = filterFamilys(persoane).length;

  const handleSortChildren = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  // Filtra las familias y aplica la ordenación según el estado actual
  const sortedFamilies = filterFamilys(persoane).sort((a, b) => {
    const childrenA = getNumberOfChildren(a.relations);
    const childrenB = getNumberOfChildren(b.relations);
    return sortOrder === "asc" ? childrenA - childrenB : childrenB - childrenA;
  });

  return (
    <>
      <div className="container-principal">
        <div className="chart">
          <Pie
            data={{
              labels: ["Barbati", "Femei", "Copii"],
              datasets: [
                {
                  data: [nrBarbati, nrFemei, nrCopii],
                  backgroundColor: [
                    "rgba(54, 162, 235, 0.7)",
                    "rgba(255, 99, 132, 0.7)",
                    "rgba(145, 63, 184, 0.7)",
                  ],
                },
              ],
            }}
            // width={300}
            // height={300}
            options={{ maintainAspectRatio: false }}
          />
        </div>
        <div className="chart">
          <div>
            <p style={{ textAlign: "center" }}>EVOLUTIA MEMBRILOR</p>
            <Line
              datasetIdKey="id345"
              data={{
                labels: getMemberHistoryYears(),
                datasets: [
                  {
                    id: 1,
                    label: "Nr.de membri",
                    data: getMemberHistory(),
                    backgroundColor: ["rgba(54, 162, 235, 1.9)"],
                  },
                ],
              }}
            />
          </div>
          <div>
            <span>Alege perioada</span>
            <div className="period">
              <p style={{ marginLeft: 12 }}>Din:</p>

              <DatePicker
                className="date-picker"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                maxDate={endDate}
                dateFormat="yyyy"
                showYearPicker
              />
            </div>
            <div className="period">
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
              />
            </div>
          </div>
        </div>
        <div className="chart">
          <Bar
            data={{
              labels: [""],
              datasets: [
                {
                  label: "Barbati",
                  data: [nrBarbati],
                  backgroundColor: "rgba(255, 99, 132, 0.7)",
                },
                {
                  label: "Femei",
                  data: [nrFemei],
                  backgroundColor: "rgba(53, 162, 235, 0.7)",
                },
              ],
            }}
          />
        </div>
        <div className="chart">
          <p>RAPORT PE VÂRSTĂ</p>
          <div className="total-text">
            <p>
              Total Membrii la{" "}
              {`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`}
              :{" "}
              <span style={{ fontWeight: "bolder", marginLeft: "5px" }}>
                {totalMembrii}
              </span>
            </p>
          </div>
          <div className="age-filter-over">
            <p>
              Membrii peste
              <input
                className="age-input"
                type="number"
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
              />
              ani:
            </p>
            <p style={{ fontWeight: "bolder", marginLeft: "10px" }}>
              {nrMembriiFilter}
            </p>
          </div>
        </div>
        <div className="chart">
          <p>EVOLUTIA COPIILOR</p>
          <Line
            datasetIdKey="id345"
            data={{
              labels: getMemberHistoryYears(),
              datasets: [
                {
                  id: 2,
                  label: "Nr.de copii",
                  data: getChildrensHistory(),
                  backgroundColor: ["rgba(54, 162, 235, 1.9)"],
                },
              ],
            }}
          />
        </div>
        <div className="chart">
          <p>RAPORT COPII</p>
          <p>Copii minori care nu sunt membrii {nrCopii}</p>
          <p>Copii majori care nu sunt membrii {nrCopiiMajoriNebotezati}</p>
        </div>
        <div className="chart">
          <p>TOTAL FAMILII: {totalFamilii}</p>
          <div
            style={{
              maxHeight: "400px",
              overflowY: "auto",
              border: "1px solid #ddd",
              padding: "5px",
            }}
          >
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Index</th>
                  <th>Familii</th>
                  {/* Agregar evento de clic en el encabezado para ordenar por número de hijos */}
                  <th
                    onClick={handleSortChildren}
                    style={{ cursor: "pointer" }}
                  >
                    Copii {sortOrder === "asc" ? "↑" : "↓"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(persoane) &&
                  sortedFamilies.map((p, index) => (
                    <tr key={p.id}>
                      <td>{index + 1}</td>
                      <td>{`${p.lastName} ${p.firstName}`}</td>
                      <td>{getNumberOfChildren(p.relations)}</td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </div>
        </div>
        <div className="chart"></div>
        <div className="chart"></div>
      </div>
    </>
  );
}
export default Grafice;
