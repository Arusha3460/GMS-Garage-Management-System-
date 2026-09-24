import { useEffect, useMemo, useState } from 'react'
import Card from '../components/Card'

const API_BASE_URL = 'http://localhost/app/backend'

function Dashboard() {
  const [customers, setCustomers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [services, setServices] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [customersRes, vehiclesRes, servicesRes, paymentsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/customers/read.php`),
          fetch(`${API_BASE_URL}/vehicles/read.php`),
          fetch(`${API_BASE_URL}/services/read.php`),
          fetch(`${API_BASE_URL}/payments/read.php`),
        ])

        const customersData = await customersRes.json()
        const vehiclesData = await vehiclesRes.json()
        const servicesData = await servicesRes.json()
        const paymentsData = await paymentsRes.json()

        setCustomers(customersData.success ? customersData.data : [])
        setVehicles(vehiclesData.success ? vehiclesData.data : [])
        setServices(servicesData.success ? servicesData.data : [])
        setPayments(paymentsData.success ? paymentsData.data : [])
      } catch (error) {
        console.error('Dashboard data load failed:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const totals = useMemo(() => {
    const totalPayments = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
    const vehiclesUnderRepair = services.filter((service) => service.status !== 'Completed').length
    const completedServices = services.filter((service) => service.status === 'Completed').length

    return {
      totalCustomers: customers.length,
      totalVehicles: vehicles.length,
      vehiclesUnderRepair,
      completedServices,
      totalPayments: totalPayments.toFixed(2),
    }
  }, [customers, vehicles, services, payments])

  const vehicleMap = useMemo(() => {
    return vehicles.reduce((acc, vehicle) => {
      acc[vehicle.id] = vehicle
      return acc
    }, {})
  }, [vehicles])

  const statusChart = useMemo(() => {
    const counts = {
      Pending: services.filter((service) => service.status === 'Pending').length,
      'In Progress': services.filter((service) => service.status === 'In Progress').length,
      Completed: services.filter((service) => service.status === 'Completed').length,
    }

    const max = Math.max(...Object.values(counts), 1)

    return Object.entries(counts).map(([label, value]) => ({
      label,
      value,
      height: `${(value / max) * 100}%`,
    }))
  }, [services])

  const recentServices = [...services].sort((a, b) => new Date(b.service_date) - new Date(a.service_date)).slice(0, 6)

  if (loading) {
    return <div className="panel empty-state">Loading dashboard data...</div>
  }

  return (
    <div className="page-stack">
      <div className="card-grid">
        <Card title="Total Customers" value={totals.totalCustomers} subtitle="Active clients" tone="blue" />
        <Card title="Total Vehicles" value={totals.totalVehicles} subtitle="In garage fleet" tone="green" />
        <Card title="Vehicles Under Repair" value={totals.vehiclesUnderRepair} subtitle="Need attention" tone="orange" />
        <Card title="Completed Services" value={totals.completedServices} subtitle="Finished jobs" tone="purple" />
        <Card title="Total Payments" value={`Tsh ${totals.totalPayments}`} subtitle="Collected revenue" tone="teal" />
      </div>

      <div className="row-grid">
        <div className="panel">
          <div className="section-header">
            <h3>Service Status</h3>
          </div>

          <div className="chart-bars" aria-label="Service status chart">
            {statusChart.map((item) => (
              <div key={item.label} className="chart-item">
                <span className="chart-bar-label">{item.label}</span>
                <div className="chart-column">
                  <div className="chart-bar" style={{ height: item.height }}></div>
                </div>
                <span className="chart-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="section-header">
            <h3>Quick Summary</h3>
          </div>
          <div className="summary-list">
            <div className="summary-item">
              <span className="summary-label">Pending</span>
              <strong>{statusChart.find((item) => item.label === 'Pending')?.value || 0}</strong>
            </div>
            <div className="summary-item">
              <span className="summary-label">In Progress</span>
              <strong>{statusChart.find((item) => item.label === 'In Progress')?.value || 0}</strong>
            </div>
            <div className="summary-item">
              <span className="summary-label">Completed</span>
              <strong>{statusChart.find((item) => item.label === 'Completed')?.value || 0}</strong>
            </div>
            <div className="summary-item">
              <span className="summary-label">Revenue</span>
              <strong>Tsh {Number(totals.totalPayments).toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="section-header">
          <h3>Recent Services</h3>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Service</th>
                <th>Status</th>
                <th>Tsh</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentServices.length > 0 ? (
                recentServices.map((service) => {
                  const vehicle = vehicleMap[service.vehicle_id]

                  return (
                    <tr key={service.id}>
                      <td>{vehicle ? `${vehicle.vehicle_model} (${vehicle.plate_number})` : 'Unknown Vehicle'}</td>
                      <td>{service.service_description}</td>
                      <td>
                        <span className={`status-badge status-${service.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {service.status}
                        </span>
                      </td>
                      <td>Tsh {Number(service.tsh ?? service.cost ?? 0).toFixed(2)}</td>
                      <td>{service.service_date}</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="5" className="empty-cell">No service records available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
