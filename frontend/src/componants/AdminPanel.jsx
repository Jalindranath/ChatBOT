import React, { useState, useEffect } from 'react';
import { XCircle, Save, Trash2, PenTool, Plus, X } from 'lucide-react';

function AdminPanel() {
  const [placements, setPlacements] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(null);
  // const API_BASE = 'http://localhost:5000';
  const API_BASE = "https://aichatbotbackend-c3bee3gtbxfjf0bv.centralindia-01.azurewebsites.net";


  const axiosConfig = {
    withCredentials: true
  };
  const [formData, setFormData] = useState({
    name_of_student: '',
    batch: '',
    placementtype: 'On-Campus',
    company: '',
    department: ''
  });

  useEffect(() => {
    fetchPlacements(currentPage);
  }, [currentPage]);

  const fetchPlacements = async (page) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`${API_BASE}/placements?page=${page}`);
      const data = await response.json();
      setPlacements(data.items || []);
      console.log("THe data in the api is ", data.items);
      setTotalPages(data.pages || 1);
      setCurrentPage(data.page || 1);
    } catch (error) {
      console.error("Error fetching placements:", error);
      setError("Failed to load placements. Please try again later.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/admin`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, form_type: "placement" })
      });
      
      
      
      const data = await response.json();
      
      if (data.success) {
        setMessage("Placement added successfully!");
        setFormData({
          name_of_student: '',
          batch: '',
          placementtype: 'On-Campus',
          company: '',
          department: ''
        });
        fetchPlacements(currentPage);
        setTimeout(() => setMessage(null), 3000);
        setIsFormVisible(false);
      } else {
        setError(data.error || "Failed to add placement");
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      console.log("The id f deletion is: ",id);
      try {
        
        const response = await fetch(`${API_BASE}/admin/delete/${id}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
          setMessage("Record deleted successfully!");
          fetchPlacements(currentPage);
          setTimeout(() => setMessage(null), 3000);
        } else {
          setError(data.error || "Failed to delete record");
          setTimeout(() => setError(null), 3000);
        }
      } catch (error) {
        setError("Error deleting record", error);
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const startEdit = (placement) => {
    setIsEditing(placement.id);
    setFormData({
      name_of_student: placement.student_name,
      batch: placement.batch,
      placementtype: placement.placement_type === 'On-Campus' ? 'On-Campus' : 'Off-Campus',
      company: placement.name_of_company,
      department: placement.department
    });
  };

  const cancelEdit = () => {
    setIsEditing(null);
  };

  const saveEdit = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/admin/update/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage("Record updated successfully!");
        setIsEditing(null);
        fetchPlacements(currentPage);
        setTimeout(() => setMessage(null), 3000);
      } else {
        setError(data.error || "Failed to update record");
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      setError("Error updating record");
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-indigo-600 p-6">
            <h1 className="text-3xl font-bold text-white text-center">Admin Panel</h1>
          </div>
          
          {/* Message/Error Alerts */}
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mx-6 mt-6 flex justify-between items-center" role="alert">
              <span>{message}</span>
              <XCircle className="h-5 w-5 cursor-pointer" onClick={() => setMessage(null)} />
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-6 mt-6 flex justify-between items-center" role="alert">
              <span>{error}</span>
              <XCircle className="h-5 w-5 cursor-pointer" onClick={() => setError(null)} />
            </div>
          )}
          
          {/* Toggle Form Button */}
          <div className="p-6 flex justify-end">
            <button
              onClick={() => setIsFormVisible(!isFormVisible)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            >
              {isFormVisible ? (
                <>
                  <X className="mr-2 h-5 w-5" />
                  Close Form
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-5 w-5" />
                  Add Placement Info
                </>
              )}
            </button>
          </div>
          
          {/* Add Placement Form */}
          {isFormVisible && (
            <div className="px-6 pb-6">
              <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Placement Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="name_of_student">
                      Student Name
                    </label>
                    <input
                      type="text"
                      id="name_of_student"
                      name="name_of_student"
                      value={formData.name_of_student}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="batch">
                      Batch
                    </label>
                    <input
                      type="text"
                      id="batch"
                      name="batch"
                      value={formData.batch}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="placementtype">
                      Placement Type
                    </label>
                    <select
                      id="placementtype"
                      name="placementtype"
                      value={formData.placementtype}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="On-Campus">On-Campus</option>
                      <option value="Off-Campus">Off-Campus</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="company">
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="department">
                      Department
                    </label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                  >
                    Add Placement
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Placement Table */}
          <div className="px-6 pb-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Placement Information</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placement Type</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {placements.length > 0 ? (
                    placements.map((placement) => (
                      <tr key={placement.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6 text-sm text-gray-900">
                          {isEditing === placement.id ? (
                            <input
                              type="text"
                              name="name_of_student"
                              value={formData.name_of_student}
                              onChange={handleInputChange}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            />
                          ) : (
                            placement.student_name
                          )}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-900">
                          {isEditing === placement.id ? (
                            <input
                              type="text"
                              name="batch"
                              value={formData.batch}
                              onChange={handleInputChange}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            />
                          ) : (
                            placement.batch
                          )}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-900">
                          {isEditing === placement.id ? (
                            <select
                              name="placementtype"
                              value={formData.placementtype}
                              onChange={handleInputChange}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            >
                              <option value="On-Campus">On-Campus</option>
                              <option value="Off-Campus">Off-Campus</option>
                            </select>
                          ) : (
                            placement.placement_type
                          )}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-900">
                          {isEditing === placement.id ? (
                            <input
                              type="text"
                              name="company"
                              value={formData.company}
                              onChange={handleInputChange}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            />
                          ) : (
                            placement.name_of_company
                          )}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-900">
                          {isEditing === placement.id ? (
                            <input
                              type="text"
                              name="department"
                              value={formData.department}
                              onChange={handleInputChange}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                            />
                          ) : (
                            placement.department
                          )}
                        </td>
                        <td className="py-4 px-6 text-sm text-center">
                          {isEditing === placement.id ? (
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => saveEdit(placement.id)}
                                className="inline-flex items-center p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200"
                                title="Save"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="inline-flex items-center p-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                                title="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => startEdit(placement)}
                                className="inline-flex items-center p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                                title="Edit"
                              >
                                <PenTool className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(placement.id)}
                                className="inline-flex items-center p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500">
                        No placement records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-6 space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;