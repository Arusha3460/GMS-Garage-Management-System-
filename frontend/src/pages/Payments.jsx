import { useEffect, useMemo, useState } from 'react'

const API_BASE_URL = 'http://localhost/app/backend'

const initialState = {
  customer_id: '',
  vehicle_id: '',
  amount: '',
  payment_date: '',
}

function Payments() {
  const [payments, setPayments] = useState([])
  const [customers, setCustomers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [formData, setFormData] = useState(initialState)
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  const apiRequest = async (endpoint, method, body = null) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })

    const result = await response.json()

    if (!response.ok || result.success === false) {
      throw new Error(result.message || 'Request failed')
    }

    return result
  }

  const loadData = async () => {
    const [customersResult, vehiclesResult, paymentsResult] = await Promise.all([
      apiRequest('/customers/read.php', 'GET'),
      apiRequest('/vehicles/read.php', 'GET'),
      apiRequest('/payments/read.php', 'GET'),
    ])

    setCustomers(customersResult.data || [])
    setVehicles(vehiclesResult.data || [])
    setPayments(paymentsResult.data || [])
  }

  useEffect(() => {
    loadData().catch((error) => {
      setMessage({ type: 'error', text: error.message })
    })
  }, [])

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const term = searchTerm.toLowerCase()
      return (
        (payment.customer_name || '').toLowerCase().includes(term) ||
        (payment.vehicle_model || '').toLowerCase().includes(term) ||
        (payment.plate_number || '').toLowerCase().includes(term)
      )
    })
  }, [payments, searchTerm])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.customer_id || !formData.vehicle_id || !formData.amount || !formData.payment_date) {
      setMessage({ type: 'error', text: 'All payment fields are required.' })
      return
    }

    try {
      await apiRequest('/payments/create.php', 'POST', {
        customer_id: Number(formData.customer_id),
        vehicle_id: Number(formData.vehicle_id),
        amount: Number(formData.amount),
        payment_date: formData.payment_date,
      })

      setMessage({ type: 'success', text: 'Payment recorded successfully.' })
      setFormData(initialState)
      await loadData()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment record?')) {
      return
    }

    try {
      await apiRequest('/payments/delete.php', 'POST', { id })
      setMessage({ type: 'success', text: 'Payment deleted successfully.' })
      await loadData()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  return (
    <div className="page-stack">
      <div className="panel">
        <div className="section-header">
          <h3>Record Payment</h3>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="input-group">
            <label htmlFor="customer_id">Customer</label>
            <select id="customer_id" name="customer_id" value={formData.customer_id} onChange={handleChange}>
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.full_name}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="vehicle_id">Vehicle</label>
            <select id="vehicle_id" name="vehicle_id" value={formData.vehicle_id} onChange={handleChange}>
              <option value="">Select vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.vehicle_model} ({vehicle.plate_number})</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="amount">Amount</label>
            <input id="amount" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} placeholder="Amount" />
          </div>

          <div className="input-group">
            <label htmlFor="payment_date">Payment Date</label>
            <input id="payment_date" name="payment_date" type="date" value={formData.payment_date} onChange={handleChange} />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn primary">Save Payment</button>
          </div>
        </form>

        {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
      </div>

      <div className="panel">
        <div className="section-header">
          <h3>Payments List</h3>
        </div>

        <div className="search-box">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search payments by customer, vehicle or plate..."
          />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.id}</td>
                    <td>{payment.customer_name || 'Unknown'}</td>
                    <td>{payment.vehicle_model || 'Unknown'} ({payment.plate_number || 'N/A'})</td>
                    <td>Tsh {Number(payment.amount).toFixed(2)}</td>
                    <td>{payment.payment_date}</td>
                    <td>
                      <button type="button" className="btn small danger" onClick={() => handleDelete(payment.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-cell">No payments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Payments
