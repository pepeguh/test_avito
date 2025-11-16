import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  TextField,
  Box,
  FormGroup,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
} from "@mui/material";

const reasonsList = [
  "Запрещённый товар",
  "Неверная категория",
  "Некорректное описание",
  "Проблемы с фото",
  "Подозрение на мошенничество",
  "Другое",
];

const RejectModal = ({ open, onClose, onSubmit, initialReason = "", initialComment = "" }) => {
  const [reason, setReason] = useState(initialReason);
  const [comment, setComment] = useState(initialComment);
  const [otherText, setOtherText] = useState("");

  const handleSubmit = () => {
    const finalReason = reason === "Другое" ? otherText || "Другое" : reason;
    if (!finalReason) {
      return;
    }
    onSubmit({ reason: finalReason, comment });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Отклонение</DialogTitle>
      <DialogContent>
        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend">Причина (обязательно)</FormLabel>
          <RadioGroup value={reason} onChange={(e) => setReason(e.target.value)}>
            {reasonsList.map((r) => (
              <FormControlLabel key={r} value={r} control={<Radio />} label={r} />
            ))}
          </RadioGroup>
        </FormControl>

        {reason === "Другое" && (
          <TextField
            label="Другое (уточните)"
            fullWidth
            margin="normal"
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
          />
        )}

        <TextField
          label="Комментарий (необязательно)"
          fullWidth
          margin="normal"
          multiline
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button color="error" variant="contained" onClick={handleSubmit}>
          Отправить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectModal;
