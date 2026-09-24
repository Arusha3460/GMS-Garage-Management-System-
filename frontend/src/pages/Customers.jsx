import { useEffect, useMemo, useState } from 'react'

const API_BASE_URL = 'http://localhost/app/backend'

const initialState = {
  full_name: '',
  phone_number: '',
  email: '',
}

function Customers() {
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

  useEffect(() => {
    loadCustomers().catch((error) => {
      setMessage({ type: 'error', text: error.message })
    })
  }, [])

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const term = searchTerm.toLowerCase()
      return (
        customer.full_name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        customer.phone_number.toLowerCase().includes(term)
      )
    })
  }, [customers, searchTerm])

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

    if (!formData.full_name || !formData.phone_number || !formData.email) {
      setMessage({ type: 'error', text: 'All fields are required.' })
      return
    }

    try {
      const payload = { ...formData }
      const endpoint = editingId ? '/customers/update.php' : '/customers/create.php'

      if (editingId) {
        payload.id = editingId
      }

      await apiRequest(endpoint, 'POST', payload)
      setMessage({
        type: 'success',
        text: editingId ? 'Customer updated successfully.' : 'Customer created successfully.',
      })
      resetForm()
      await loadCustomers()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  const handleEdit = (customer) => {
    setEditingId(customer.id)
    setFormData({
      full_name: customer.full_name,
      phone_number: customer.phone_number,
      email: customer.email,
    })
    setMessage({ type: '', text: '' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return
    }

    try {
      await apiRequest('/customers/delete.php', 'POST', { id })
      setMessage({ type: 'success', text: 'Customer deleted successfully.' })
      resetForm()
      await loadCustomers()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  return (
    <div className="page-stack">
      <div className="panel">
        <div className="section-header">
          <h3>{editingId ? 'Edit Customer' : 'Add Customer'}</h3>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="input-group">
            <label htmlFor="full_name">Full Name</label>
            <input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Full name" />
          </div>

          <div className="input-group">
            <label htmlFor="phone_number">Phone Number</label>
            <input id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Phone number" />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email address" />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn primary">{editingId ? 'Update' : 'Save'}</button>
            {editingId && (
              <button type="button" className="btn secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
      </div>

      <div className="panel">
        <div className="section-header">
          <h3>Customers List</h3>
        </div>

        <div className="search-box">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search customers by name, email or phone..."
          />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Phone Number</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.id}</td>
                    <td>{customer.full_name}</td>
                    <td>{customer.phone_number}</td>
                    <td>{customer.email}</td>
                    <td>
                      <div className="inline-actions">
                        <button type="button" className="btn small secondary" onClick={() => handleEdit(customer)}>Edit</button>
                        <button type="button" className="btn small danger" onClick={() => handleDelete(customer.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-cell">No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Customers
