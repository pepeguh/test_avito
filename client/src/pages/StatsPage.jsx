import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  MenuItem,
  Select,
  CircularProgress,
  Button,
} from "@mui/material";

import {
  fetchSummary,
  fetchActivity,
  fetchDecisions,
  fetchCategories,
} from "../api/apiClient";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PageWrapper from "../components/PageWrapper";

import "../styles/Fonts/Roboto-Regular-normal.js";

const COLORS = ["#4caf50", "#f44336", "#ff9800"];

const StatsPage = () => {
  const [period, setPeriod] = useState("week");

  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState(null);
  const [decisions, setDecisions] = useState(null);
  const [categories, setCategories] = useState(null);

  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);

    try {
      const [s, a, d, c] = await Promise.all([
        fetchSummary(period),
        fetchActivity(period),
        fetchDecisions(period),
        fetchCategories(period),
      ]);

      setSummary(s);
      setActivity(a);
      setDecisions(d);
      setCategories(
        Object.entries(c).map(([name, value]) => ({
          name,
          value,
        }))
      );
      console.log(s, a, d, c);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [period]);

  const exportCSV = () => {
    let csv = "Всего объявлений проверено: " + summary.totalReviewed + "\n";
    csv += "Одобрено: " + summary.approvedPercentage.toFixed(1) + "% " + "\n";
    csv += "Отклонено: " + summary.rejectedPercentage.toFixed(1) + "% " + "\n";
    csv +=
      "Среднее время проверки: " + summary.averageReviewTime + " сек" + "\n";

    csv += "\nАктивность по дням\n";

    activity.forEach((a) => {
      csv += `${a.date} Одобрено: ${a.approved}, Отклонено: ${a.rejected}, Доработка: ${a.requestChanges}\n`;
    });

    csv += "\nРаспределение решений\n";
    csv += `Одобрено: ${decisions.approved.toFixed(1)}%\n`;
    csv += `Отклонено: ${decisions.rejected.toFixed(1)}%\n`;
    csv += `Доработка: ${decisions.requestChanges.toFixed(1)}%\n`;

    csv += "\nПо категориям\n";
    categories.forEach((c) => {
      csv += `${c.name}: ${c.value}\n`;
    });

    const csvContent = "\uFEFF" + csv;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `stats_${period}.csv`;
    link.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("Roboto-VariableFont_wdth,wght", "normal");

    doc.setFontSize(20);
    doc.text("Отчёт", 14, 20);

    doc.setFontSize(12);
    doc.text(
      `Период: ${period == "week" ? "неделя" : period == "today" ? "сегодня" : "месяц"}`,
      14,
      30
    );

    autoTable(doc, {
      startY: 40,
      head: [["Параметр", "Значение"]],
      body: [
        ["Всего проверено", summary.totalReviewed],
        ["Одобрено", summary.approvedPercentage.toFixed(1) + "%"],
        ["Отклонено", summary.rejectedPercentage.toFixed(1) + "%"],
        ["Среднее время проверки", summary.averageReviewTime + "s"],
      ],
      styles: {
        fontSize: 11,
        font: "Roboto-VariableFont_wdth,wght",
        fontStyle: "normal",
      },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Дата", "Одобрено", "Отклонено", "Доработка"]],
      body: activity.map((a) => [
        a.date,
        a.approved,
        a.rejected,
        a.requestChanges,
      ]),
      styles: {
        fontSize: 11,
        font: "Roboto-VariableFont_wdth,wght",
        fontStyle: "normal",
      },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Решение", "Количество"]],
      body: [
        ["Одобрено", decisions.approved.toFixed(1)],
        ["Отклонено", decisions.rejected.toFixed(1)],
        ["Доработка", decisions.requestChanges.toFixed(1)],
      ],
      styles: {
        fontSize: 11,
        font: "Roboto-VariableFont_wdth,wght",
        fontStyle: "normal",
      },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Категория", "Количество"]],
      body: categories.map((c) => [c.name, c.value]),
      styles: {
        fontSize: 11,
        font: "Roboto-VariableFont_wdth,wght",
        fontStyle: "normal",
      },
    });

    doc.save(`stats_${period}.pdf`);
  };

  if (loading || !summary) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageWrapper>
      <Box p={3}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4">Статистика модератора</Typography>
          <Box>
            <Button sx={{ mr: 1 }} variant="contained" onClick={exportCSV}>
              Экспорт CSV
            </Button>
            <Button sx={{ mr: 1 }} variant="contained" onClick={exportPDF}>
              Экспорт PDF
            </Button>
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              size="small"
            >
              <MenuItem value="today">Сегодня</MenuItem>
              <MenuItem value="week">Неделя</MenuItem>
              <MenuItem value="month">Месяц</MenuItem>
            </Select>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2">Всего проверено</Typography>
              <Typography variant="h5">{summary.totalReviewed}</Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2">% Одобрено</Typography>
              <Typography variant="h5">
                {summary.approvedPercentage.toFixed(1)}%
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2">% Отклонено</Typography>
              <Typography variant="h5">
                {summary.rejectedPercentage.toFixed(1)}%
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2">
                Среднее время проверки
              </Typography>
              <Typography variant="h5">{summary.averageReviewTime}s</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" mb={2}>
            Активность по дням
          </Typography>
          <BarChart width={800} height={300} data={activity}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="approved" fill="#4caf50" name="Одобрено" />
            <Bar dataKey="rejected" fill="#f44336" name="Отклонено" />
            <Bar dataKey="requestChanges" fill="#ff9800" name="Доработка" />
          </BarChart>
        </Paper>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" mb={2}>
            Распределение решений
          </Typography>
          <PieChart width={400} height={300}>
            <Pie
              data={[
                {
                  name: "Одобрено",
                  value: Number(decisions.approved.toFixed(1)),
                },
                {
                  name: "Отклонено",
                  value: Number(decisions.rejected.toFixed(1)),
                },
                {
                  name: "Доработка",
                  value: Number(decisions.requestChanges.toFixed(1)),
                },
              ]}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) => `${(percent * 100).toFixed(1)}%`}
              dataKey="value"
            >
              {COLORS.map((c, i) => (
                <Cell key={i} fill={c} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </Paper>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" mb={2}>
            По категориям
          </Typography>

          <BarChart width={800} height={300} data={categories}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar name="Количество" dataKey="value" fill="#2196f3" />
          </BarChart>
        </Paper>
      </Box>
    </PageWrapper>
  );
};

export default StatsPage;
