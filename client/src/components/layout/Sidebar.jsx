import { Box, List, ListItemButton, ListItemText } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'

const Sidebar = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const menu = [
    { label: 'Объявления', path: '/list' },
    { label: 'Статистика', path: '/stats' },
  ]

  return (
    <Box
      width={200}
      bgcolor="background.paper"
      borderRight="1px solid #ddd"
      p={1}
      sx={{ height: '100vh' }}
    >
      <List>
        {menu.map(item => (
          <ListItemButton
            key={item.path}
            selected={pathname === item.path}
            onClick={() => navigate(item.path)}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  )
}

export default Sidebar
