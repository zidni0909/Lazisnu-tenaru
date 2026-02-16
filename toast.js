// Toast Notification System
export function showToast(message, type = 'success') {
  // Remove existing toast
  const existingToast = document.getElementById('toast-notification')
  if (existingToast) {
    existingToast.remove()
  }

  // Create toast element
  const toast = document.createElement('div')
  toast.id = 'toast-notification'
  toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ${
    type === 'success' ? 'bg-green-600 text-white' :
    type === 'error' ? 'bg-red-600 text-white' :
    type === 'warning' ? 'bg-yellow-600 text-white' :
    'bg-blue-600 text-white'
  }`
  
  toast.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="text-2xl">
        ${type === 'success' ? '✓' : type === 'error' ? '✗' : type === 'warning' ? '⚠' : 'ℹ'}
      </span>
      <span class="font-medium">${message}</span>
    </div>
  `

  document.body.appendChild(toast)

  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)'
  }, 10)

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.transform = 'translateX(400px)'
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}
