import { useEffect, useMemo, useState } from 'react'

const API_BASE_URL = 'http://localhost/app/backend'

function Invoices() {
  const [customers, setCustomers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [services, setServices] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [customersRes, vehiclesRes, servicesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/customers/read.php`),
          fetch(`${API_BASE_URL}/vehicles/read.php`),
          fetch(`${API_BASE_URL}/services/read.php`),
        ])

        const customersData = await customersRes.json()
        const vehiclesData = await vehiclesRes.json()
        const servicesData = await servicesRes.json()

        setCustomers(customersData.success ? customersData.data : [])
        setVehicles(vehiclesData.success ? vehiclesData.data : [])
        setServices(servicesData.success ? servicesData.data : [])
      } catch (error) {
        console.error('Invoice data failed:', error)
      }
    }

    loadData()
  }, [])

  const invoiceItems = useMemo(() => {
    return services.filter((service) => {
      const matchCustomer = selectedCustomer ? Number(service.vehicle_id) === Number(selectedVehicle) || !selectedVehicle : true
      if (selectedCustomer && selectedVehicle) {
        return Number(service.vehicle_id) === Number(selectedVehicle)
      }

      if (selectedCustomer) {
        const vehicleIds = vehicles
          .filter((vehicle) => Number(vehicle.customer_id) === Number(selectedCustomer))
          .map((vehicle) => vehicle.id)

        return vehicleIds.includes(Number(service.vehicle_id))
      }

      if (selectedVehicle) {
        return Number(service.vehicle_id) === Number(selectedVehicle)
      }

      return true
    })
  }, [selectedCustomer, selectedVehicle, services, vehicles])

  const totalAmount = invoiceItems.reduce((sum, item) => sum + Number(item.tsh ?? item.cost ?? 0), 0)
  const currentCustomer = customers.find((customer) => Number(customer.id) === Number(selectedCustomer))
  const currentVehicle = vehicles.find((vehicle) => Number(vehicle.id) === Number(selectedVehicle))

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="page-stack">
      <div className="panel">
        <div className="section-header">
          <h3>Invoices & Service Reports</h3>
          <button type="button" className="btn primary" onClick={handlePrint}>Print</button>
        </div>

        <div className="form-grid">
          <div className="input-group">
            <label htmlFor="customerFilter">Customer</label>
            <select id="customerFilter" value={selectedCustomer} onChange={(event) => setSelectedCustomer(event.target.value)}>
              <option value="">All customers</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.full_name}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="vehicleFilter">Vehicle</label>
            <select id="vehicleFilter" value={selectedVehicle} onChange={(event) => setSelectedVehicle(event.target.value)}>
              <option value="">All vehicles</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.plate_number} - {vehicle.vehicle_model}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="panel invoice-panel">
        <div className="invoice-header">
          <div>
            <p className="nav-kicker">Garage Management</p>
            <h3>Invoice</h3>
          </div>
          <div className="invoice-total">Total: Tsh {totalAmount.toFixed(2)}</div>
        </div>

        <div className="invoice-meta">
          <div>
            <strong>Customer:</strong> {currentCustomer ? currentCustomer.full_name : 'All Customers'}
          </div>
          <div>
            <strong>Vehicle:</strong> {currentVehicle ? `${currentVehicle.vehicle_model} (${currentVehicle.plate_number})` : 'All Vehicles'}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Vehicle</th>
              <th>Status</th>
              <th>Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceItems.length > 0 ? (
              invoiceItems.map((item) => {
                const vehicle = vehicles.find((v) => Number(v.id) === Number(item.vehicle_id))
                return (
                  <tr key={item.id}>
                    <td>{item.service_description}</td>
                    <td>{vehicle ? `${vehicle.vehicle_model} (${vehicle.plate_number})` : 'Unknown'}</td>
                    <td>
                      <span className={`status-badge status-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.service_date}</td>
                    <td>Tsh {Number(item.tsh ?? item.cost ?? 0).toFixed(2)}</td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="5" className="empty-cell">No invoice items found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Invoices
