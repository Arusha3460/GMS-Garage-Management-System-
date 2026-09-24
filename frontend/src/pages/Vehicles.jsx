import { useEffect, useMemo, useState } from 'react'

const API_BASE_URL = 'http://localhost/app/backend'

const initialState = {
  plate_number: '',
  vehicle_model: '',
  vehicle_type: '',
  customer_id: '',
}

function Vehicles() {
  const [vehicles, setVehicles] = useState([])
  const [customers, setCustomers] = useState([])
  const [formData, setFormData] = useState(initialState)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  const apiRequest = async (endpoint, method, body = null) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const result = await response.json()

    if (!response.ok || result.success === false) {
      throw new Error(result.message || 'Request failed')
    }

    return result
  }

  const loadCustomers = async () => {
    const result = await apiRequest('/customers/read.php', 'GET')
    setCustomers(result.data || [])
  }

  const loadVehicles = async () => {
    const result = await apiRequest('/vehicles/read.php', 'GET')
    setVehicles(result.data || [])
  }

  useEffect(() => {
    Promise.all([loadCustomers(), loadVehicles()]).catch((error) => {
      setMessage({ type: 'error', text: error.message })
    })
  }, [])

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const term = searchTerm.toLowerCase()
      return (
        vehicle.plate_number.toLowerCase().includes(term) ||
        vehicle.vehicle_model.toLowerCase().includes(term) ||
        (vehicle.customer_name || '').toLowerCase().includes(term) ||
        vehicle.vehicle_type.toLowerCase().includes(term)
      )
    })
  }, [vehicles, searchTerm])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData(initialState)
    setEditingId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.plate_number || !formData.vehicle_model || !formData.vehicle_type || !formData.customer_id) {
      setMessage({ type: 'error', text: 'All vehicle fields are required.' })
      return
    }

    try {
      const payload = { ...formData, customer_id: Number(formData.customer_id) }
      const endpoint = editingId ? '/vehicles/update.php' : '/vehicles/create.php'

      if (editingId) {
        payload.id = editingId
      }

      await apiRequest(endpoint, 'POST', payload)
      setMessage({
        type: 'success',
        text: editingId ? 'Vehicle updated successfully.' : 'Vehicle added successfully.',
      })
      resetForm()
      await loadVehicles()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  const handleEdit = (vehicle) => {
    setEditingId(vehicle.id)
    setFormData({
      plate_number: vehicle.plate_number,
      vehicle_model: vehicle.vehicle_model,
      vehicle_type: vehicle.vehicle_type,
      customer_id: String(vehicle.customer_id),
    })
    setMessage({ type: '', text: '' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle?')) {
      return
    }

    try {
      await apiRequest('/vehicles/delete.php', 'POST', { id })
      setMessage({ type: 'success', text: 'Vehicle deleted successfully.' })
      resetForm()
      await loadVehicles()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  return (
    <div className="page-stack">
      <div className="panel">
        <div className="section-header">
          <h3>{editingId ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="input-group">
            <label htmlFor="plate_number">Plate Number</label>
            <input id="plate_number" name="plate_number" value={formData.plate_number} onChange={handleChange} placeholder="Plate number" />
          </div>

          <div className="input-group">
            <label htmlFor="vehicle_model">Vehicle Model</label>
            <input id="vehicle_model" name="vehicle_model" value={formData.vehicle_model} onChange={handleChange} placeholder="Vehicle model" />
          </div>

          <div className="input-group">
            <label htmlFor="vehicle_type">Vehicle Type</label>
            <input id="vehicle_type" name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} placeholder="Vehicle type" />
          </div>

          <div className="input-group">
            <label htmlFor="customer_id">Customer</label>
            <select id="customer_id" name="customer_id" value={formData.customer_id} onChange={handleChange}>
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.full_name}</option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn primary">{editingId ? 'Update' : 'Save'}</button>
            {editingId && (
              <button type="button" className="btn secondary" onClick={resetForm}>Cancel</button>
            )}
          </div>
        </form>

        {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
      </div>

      <div className="panel">
        <div className="section-header">
          <h3>Vehicles List</h3>
        </div>

        <div className="search-box">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by plate, model, type or customer..."
          />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Plate Number</th>
                <th>Model</th>
                <th>Type</th>
                <th>Customer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.id}</td>
                    <td>{vehicle.plate_number}</td>
                    <td>{vehicle.vehicle_model}</td>
                    <td>{vehicle.vehicle_type}</td>
                    <td>{vehicle.customer_name || 'Unknown'}</td>
                    <td>
                      <div className="inline-actions">
                        <button type="button" className="btn small secondary" onClick={() => handleEdit(vehicle)}>Edit</button>
                        <button type="button" className="btn small danger" onClick={() => handleDelete(vehicle.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-cell">No vehicles found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Vehicles
