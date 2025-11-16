import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAds, setCurrentAd, updateAd } from "../app/slices/adsSlice";
import {
  fetchAds,
  getAd,
  approveAd,
  rejectAd,
  requestChanges,
} from "../api/apiClient";

import {
  Box,
  Typography,
  Grid,
  Button,
  Paper,
  Divider,
  CircularProgress,
} from "@mui/material";
import { ArrowLeftSharp, ArrowRightSharp } from "@mui/icons-material";
import { ArrowRightAltRounded } from "@mui/icons-material";

import CarouselAds from "../components/CarouselAds";
import CharTable from "../components/CharTable";
import HistoryTable from "../components/HistoryTable";
import RejectModal from "../components/RejectModal";
import ChangesModal from "../components/ChangesModal";
import PageWrapper from "../components/PageWrapper";

const ItemPage = () => {
  const { id } = useParams();
  const adId = Number(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { ads, currentAd, actionLoading } = useSelector((state) => state.ads);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);

  useEffect(() => {
    async function loadList() {
      if (!ads || ads.length === 0) {
        const data = await fetchAds(1, 10);
        dispatch(setAds(data.items));
      }
    }
    loadList();
  }, []);

  useEffect(() => {
    async function load() {
      const ad = await getAd(adId);
      dispatch(setCurrentAd(ad));
    }
    load();
  }, [adId]);

  const currentIndex = useMemo(
    () => ads.findIndex((a) => a.id === adId),
    [ads, adId]
  );
  const handleBack = () => navigate("/list");

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevId = ads[currentIndex - 1]?.id;
      if (prevId) navigate(`/item/${prevId}`);
    }
  };

  const handleNext = () => {
    if (currentIndex < ads.length - 1) {
      const nextId = ads[currentIndex + 1]?.id;
      if (nextId) navigate(`/item/${nextId}`);
    }
  };

  const onApprove = async () => {
    const updated = await approveAd(adId);
    console.log(updated);
    dispatch(updateAd(updated.ad || updated));
  };

  const onReject = async ({ reason, comment }) => {
    const updated = await rejectAd(adId, { reason, comment });
    dispatch(updateAd(updated.ad || updated));
    setRejectOpen(false);
  };

  const onRequestChanges = async ({ reason, comment }) => {
    const updated = await requestChanges(adId, { reason, comment });
    dispatch(updateAd(updated.ad || updated));
    setRequestOpen(false);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      switch (e.key) {
        case "a":
        case "A":
        case "ф":
        case "Ф":
          if (!actionLoading) onApprove();
          break;

        case "d":
        case "D":
        case "в":
        case "В":
          if (!actionLoading) setRejectOpen(true);
          break;

        case "ArrowRight":
          handleNext();
          break;

        case "ArrowLeft":
          handlePrev();
          break;

        default:
          break;
      }
    };

    window.addEventListener("keyup", handleKey);
    return () => window.removeEventListener("keyup", handleKey);
  }, [actionLoading, currentIndex, ads, onApprove]);

  if (!currentAd) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  const {
    images = [],
    title,
    description,
    price,
    category,
    createdAt,
    seller = {},
    characteristics = {},
    moderationHistory = [],
    status,
    priority,
  } = currentAd;

  return (
    <PageWrapper>
      <Box p={2}>
        <Typography variant="h5" mb={2}>
          {title}
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 6, md: 6, sm: 6 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <CarouselAds images={images} />
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              variant="outlined"
              sx={{ p: 2, maxHeight: { xs: 250, md: 400 }, overflowY: "auto" }}
            >
              <Typography variant="subtitle1" fontWeight={700} mb={1}>
                История модерации
              </Typography>
              <HistoryTable history={moderationHistory} />
            </Paper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6">Полное описание</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight={700}>
                Характеристики
              </Typography>
              <CharTable characteristics={characteristics} />

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight={700}>
                Продавец
              </Typography>
              <Typography>
                Имя: <strong>{seller?.name || "-"}</strong>
              </Typography>
              <Typography>Рейтинг: {seller?.rating || "-"}</Typography>
              <Typography>Объявлений: {seller?.totalAds ?? "-"}</Typography>
              <Typography>
                На сайте:{" "}
                {seller?.registeredAt
                  ? `${Math.floor((Date.now() - new Date(seller.registeredAt)) / (1000 * 60 * 60 * 24 * 30))} мес.`
                  : "-"}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary">
                Статус:{" "}
                {status == "rejected"
                  ? "Отклонено"
                  : status == "approved"
                    ? "Одобрено"
                    : "На доработке"}{" "}
                • Приоритет: {priority == "normal" ? "Нормальный" : "Срочный"} •
                Создано: {new Date(createdAt).toLocaleString("ru-RU")}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Button
                variant="contained"
                color="success"
                onClick={onApprove}
                disabled={actionLoading}
              >
                Одобрить
              </Button>

              <Button
                variant="contained"
                color="error"
                onClick={() => setRejectOpen(true)}
                disabled={actionLoading}
              >
                Отклонить
              </Button>

              <Button
                variant="contained"
                color="warning"
                onClick={() => setRequestOpen(true)}
                disabled={actionLoading}
              >
                Вернуть на доработку
              </Button>

              <Box sx={{ flex: 1 }} />

              <Button variant="outlined" onClick={handleBack}>
                Назад к списку
              </Button>
              <Button
                startIcon={<ArrowLeftSharp />}
                onClick={handlePrev}
                disabled={currentIndex <= 0}
              >
                Пред
              </Button>
              <Button
                endIcon={<ArrowRightSharp />}
                onClick={handleNext}
                disabled={currentIndex < 0 || currentIndex >= ads.length - 1}
              >
                След
              </Button>
            </Box>
          </Grid>
        </Grid>

        <RejectModal
          open={rejectOpen}
          onClose={() => setRejectOpen(false)}
          onSubmit={onReject}
        />
        <ChangesModal
          open={requestOpen}
          onClose={() => setRequestOpen(false)}
          onSubmit={onRequestChanges}
        />
      </Box>
    </PageWrapper>
  );
};

export default ItemPage;
