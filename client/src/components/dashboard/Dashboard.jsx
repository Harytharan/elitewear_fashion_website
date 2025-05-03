// Dashboard.js
import React, { useState,useEffect,useRef } from "react";
import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import "chart.js/auto";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { LineChart } from "@mui/x-charts/LineChart";
import { FaUsers,FaUserTie,FaChartPie,FaUserPlus } from "react-icons/fa";
import AddUserPopup from "../users/AddUserPopup"; // Make sure path is correct

export default function Dashboard() {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [userCounts, setUserCounts] = useState({
      total: 0,
      customers: 0,
      managers: 0,
    });
    const chartRef = useRef(null);

  const data = {
    labels: ["January", "February", "March", "April", "May"],
    datasets: [
      {
        label: "Sales",
        data: [500, 400, 200, 500, 700],
        backgroundColor: "#a98467",
      },
    ],
  };
  const getDate = (x) => {
    const today = new Date();
    today.setDate(today.getDate() - x);
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const formattedDate = today.toLocaleDateString("en-CA", options);
    const dayOrder = orders.filter((item) =>
      item.createdAt.split("T")[0].includes(formattedDate)
    );
    const lengths = dayOrder.length;
    return lengths;
  };
  const dddf = getDate(27);
  console.log(dddf);

  const getTodayDay = (x) => {
    const today = new Date();
    today.setDate(today.getDate() - x);
    const options = {
      weekday: "long",
    };
    const formattedDate = today.toLocaleDateString("en-CA", options);
    console.log(formattedDate);
    return formattedDate;
  };

  const xLabels = [
    getTodayDay(0),
    getTodayDay(1),
    getTodayDay(2),
    getTodayDay(3),
    getTodayDay(4),
    getTodayDay(5),
    getTodayDay(6),
  ];
  
  const uData = [
    getDate(0),
    getDate(1),
    getDate(2),
    getDate(3),
    getDate(4),
    getDate(5),
    getDate(6),
  ];
  useEffect(() => {
      fetchUsers();
    }, []);

    useEffect(() => {
        const fetchOrders = async () => {
          try {
            const data = await axios.get("/api/order/get");
            setOrders(data.data);
    
            const allDates = data.data.map((ord) => ord.createdAt.split("T")[0]);
            setDates((prevDates) => [...prevDates, ...allDates]);
            console.log(dates);
          } catch (error) {
            console.log(error);
          }
        };
    
        fetchOrders();
      }, []);

  const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/user/all-Users");
        setUsers(response.data);
        calculateUserCounts(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        Swal.fire("Error!", "Failed to fetch users.", "error");
      }
    };

    const calculateUserCounts = (userData) => {
      const counts = {
        total: userData.length,
        customers: userData.filter((user) => user.usertype === "customer").length,
        managers: userData.filter((user) => user.ismanager).length,
      };
      setUserCounts(counts);
    };

    const UserDistributionChart = () => {
        const data = [
          { name: "Managers", value: userCounts.managers },
          { name: "Customers", value: userCounts.customers },
        ];
        const COLORS = ["#d4a373", "#a98467"];
    
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-4 rounded-lg shadow-md"
          >
            <h3 className="text-lg font-semibold mb-4">User Distribution</h3>
            <div ref={chartRef}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        );
      };

  const CountCard = ({ title, count, icon }) => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4 w-64"
      >
        <div className="bg-[#d4a373] p-3 rounded-full">{icon}</div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-2xl font-bold">{count}</p>
        </div>
      </motion.div>
    );

  return (
    <motion.main
      className="p-10 bg-PrimaryColor min-h-screen z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-ExtraDarkColor mb-6">
          Dashboard Overview!
        </h1>
        <button
          onClick={() => setIsAddUserOpen(true)}
          className="flex items-center bg-[#d4a373] text-white px-4 py-2 rounded-lg hover:bg-[#a98467] transition duration-300 shadow-md"
        >
          <FaUserPlus className="mr-2" />
          Add User
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        <CountCard
          title="Total Users"
          count={userCounts.total}
          icon={<FaUsers className="text-white text-2xl" />}
        />
        <CountCard
          title="Customers"
          count={userCounts.customers}
          icon={<FaUserTie className="text-white text-2xl" />}
        />
        <CountCard
          title="Managers"
          count={userCounts.managers}
          icon={<FaChartPie className="text-white text-2xl" />}
        />
        <CountCard
        title="Total Orders"
        count={orders.length}
        icon={<FaChartPie className="text-white text-2xl" />}
      />
      </div>



      <div className="md:grid md:grid-cols-2 gap-3 pt-5 justify-center" >
      <div className="bg-SecondaryColor p-8 rounded-lg shadow-md">
        <Bar data={data} />
      </div>
      <div className="md:col-span-1">
                <UserDistributionChart />
      </div>
      <div ref={chartRef}>
          <LineChart
            width={600}
            height={300}
            series={[
              // { data: pData, label: "pv" },
              { data: uData, label: "Daily Orders" },
            ]}
            xAxis={[{ scaleType: "point", data: xLabels }]}
          />
        </div>
      </div>

      {isAddUserOpen && (
        <AddUserPopup
          closePopup={() => setIsAddUserOpen(false)}
          refreshUsers={() => {}}
        />
      )}
    </motion.main>
  );
}
