import React from "react";
import { Box, Typography, List, ListItem, ListItemText, Paper } from "@mui/material";

const HistoryTable = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="body2">Истории модерации нет</Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 1 }}>
      <List dense>
        {history.map((h) => (
          <ListItem key={h.id} alignItems="flex-start" divider>
            <ListItemText
              primary={`${h.moderatorName} — ${new Date(h.timestamp).toLocaleString("ru-RU")}`}
              primaryTypographyProps={{ component: "span" }}

              secondary={
                <Box component="span">
                  <Typography component="span" variant="body2" sx={{ display: "block" }}>
                    {h.action === "approved" ? "Одобрено" : h.action === "rejected" ? "Отклонено" : "Требуются изменения"}
                  </Typography>
                  <Typography component="span" style={{display:'flex',flexDirection:'column'}}>
                  {h.reason && <Typography component="span" variant="caption">Причина: {h.reason}</Typography>}
                  {h.comment && <Typography component="span" variant="body2">{h.comment}</Typography>}

                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default HistoryTable;
