import React from "react";
import { Table, TableBody, TableRow, TableCell, TableContainer, Paper, Typography } from "@mui/material";

const CharTable = ({ characteristics = {} }) => {
  const entries = Object.entries(characteristics || {});
  if (entries.length === 0) return null;

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
      <Table size="small">
        <TableBody>
          {entries.map(([key, value]) => (
            <TableRow key={key}>
              <TableCell sx={{ width: "40%", fontWeight: 600 }}>{key}</TableCell>
              <TableCell>{value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CharTable;