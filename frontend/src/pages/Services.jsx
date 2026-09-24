import { useEffect, useMemo, useState } from 'react'

const API_BASE_URL = 'http://localhost/app/backend'

const initialState = {
  vehicle_id: '',
  service_description: '',
  tsh: '',
  status: 'Pending',
  service_date: '',
}

function Services() {
  const [services, setServices] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [formData, setFormData] = useState(initialState)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
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

  const loadVehicles = async () => {
    const result = await apiRequest('/vehicles/read.php', 'GET')
    setVehicles(result.data || [])
  }

  const loadServices = async () => {
    const result = await apiRequest('/services/read.php', 'GET')
    setServices(result.data || [])
  }

  useEffect(() => {
    Promise.all([loadVehicles(), loadServices()]).catch((error) => {
      setMessage({ type: 'error', text: error.message })
    })
  }, [])

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchStatus = statusFilter === 'All' || service.status === statusFilter
      const term = searchTerm.toLowerCase()
      const description = (service.service_description || '').toLowerCase()
      const vehicleLabel = `${service.vehicle_model || ''} ${service.plate_number || ''}`.toLowerCase()
      return matchStatus && (description.includes(term) || vehicleLabel.includes(term))
    })
  }, [services, searchTerm, statusFilter])

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

    if (!formData.vehicle_id || !formData.service_description || !formData.tsh || !formData.service_date) {
      setMessage({ type: 'error', text: 'All service fields are required.' })
      return
    }

    try {
      const payload = {
        ...formData,
        vehicle_id: Number(formData.vehicle_id),
        tsh: Number(formData.tsh),
      }

      const endpoint = editingId ? '/services/update.php' : '/services/create.php'

      if (editingId) {
        payload.id = editingId
      }

      await apiRequest(endpoint, 'POST', payload)
      setMessage({
        type: 'success',
        text: editingId ? 'Service updated successfully.' : 'Service created successfully.',
      })
      resetForm()
      await loadServices()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  const handleEdit = (service) => {
    setEditingId(service.id)
    setFormData({
      vehicle_id: String(service.vehicle_id),
      service_description: service.service_description,
      tsh: String(service.tsh ?? service.cost ?? 0),
      status: service.status,
      service_date: service.service_date,
    })
    setMessage({ type: '', text: '' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service record?')) {
      return
    }

    try {
      await apiRequest('/services/delete.php', 'POST', { id })
      setMessage({ type: 'success', text: 'Service deleted successfully.' })
      resetForm()
      await loadServices()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  return (
    <div className="page-stack">
      <div className="panel">
        <div className="section-header">
          <h3>{editingId ? 'Edit Service' : 'Add Service'}</h3>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
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
            <label htmlFor="service_description">Service Description</label>
            <input id="service_description" name="service_description" value={formData.service_description} onChange={handleChange} placeholder="Description" />
          </div>

          <div className="input-group">
            <label htmlFor="tsh">Tsh</label>
            <input id="tsh" name="tsh" type="number" step="0.01" value={formData.tsh} onChange={handleChange} placeholder="Tsh" />
          </div>

          <div className="input-group">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={formData.status} onChange={handleChange}>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="service_date">Date</label>
            <input id="service_date" name="service_date" type="date" value={formData.service_date} onChange={handleChange} />
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
          <h3>Service Records</h3>
        </div>

        <div className="toolbar-row">
          <div className="search-box compact">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search services..."
            />
          </div>

          <div className="input-group compact-select">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehicle</th>
                <th>Description</th>
                <th>Tsh</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <tr key={service.id}>
                    <td>{service.id}</td>
                    <td>{service.vehicle_model || 'Unknown'} ({service.plate_number || 'N/A'})</td>
                    <td>{service.service_description}</td>
                    <td>Tsh {Number(service.tsh ?? service.cost ?? 0).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${service.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {service.status}
                      </span>
                    </td>
                    <td>{service.service_date}</td>
                    <td>
                      <div className="inline-actions">
                        <button type="button" className="btn small secondary" onClick={() => handleEdit(service)}>Edit</button>
                        <button type="button" className="btn small danger" onClick={() => handleDelete(service.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-cell">No services found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Services
