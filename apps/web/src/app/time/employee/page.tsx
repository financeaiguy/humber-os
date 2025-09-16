import EmployeeClockView from '@/components/time-tracking/EmployeeClockView'

export default function EmployeeTimePage() {
  // In a real app, you would get the employee data from authentication/session
  const mockEmployeeData = {
    id: 'emp_001',
    name: 'Sarah Johnson',
    role: 'Senior Electrical Engineer',
    project: 'GM Assembly Line',
    avatar: 'SJ'
  }

  return <EmployeeClockView employeeData={mockEmployeeData} />
}