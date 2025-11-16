import React, { useEffect, useState, useRef } from "react";
import { fetchAds, approveAd, rejectAd } from "../api/apiClient";
import { useDispatch, useSelector } from "react-redux";
import { setAds, updateAd } from "../app/slices/adsSlice";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CardMedia,
  Button,
  TextField,
  MenuItem,
  Chip,
  Pagination,
  Menu,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  LinearProgress,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import PageWrapper from "../components/PageWrapper";

const statuses = [
  { value: "pending", label: "На модерации" },
  { value: "approved", label: "Одобрено" },
  { value: "rejected", label: "Отклонено" },
];
const categories = [
  { value: 0, label: "Электроника" },
  { value: 1, label: "Недвижимость" },
  { value: 2, label: "Транспорт" },
  { value: 3, label: "Работа" },
  { value: 4, label: "Услуги" },
  { value: 5, label: "Животные" },
  { value: 6, label: "Мода" },
  { value: 7, label: "Детское" },
];

const SortControl = ({ sortBy, sortOrder, setSortBy, setSortOrder }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const options = [
    { label: "Дата создания", value: "createdAt" },
    { label: "Цена", value: "price" },
    { label: "Приоритет", value: "priority" },
  ];

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelect = (value) => {
    if (sortBy === value) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(value);
      setSortOrder("asc");
    }
    handleClose();
  };
  const displayLabel = sortBy
    ? options.find((o) => o.value === sortBy)?.label
    : "Сортировка";

  return (
    <Box mb={2}>
      <Button
        variant="outlined"
        onClick={handleClick}
        endIcon={
          sortBy ? (
            sortOrder === "asc" ? (
              <ArrowUpwardIcon />
            ) : (
              <ArrowDownwardIcon />
            )
          ) : (
            <Box sx={{ display: "flex", flexDirection: "row", gap: 0 }}>
              <ArrowUpwardIcon fontSize="small" />
              <ArrowDownwardIcon fontSize="small" sx={{ ml: "-5px" }} />
            </Box>
          )
        }
      >
        {displayLabel}
      </Button>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {options.map((opt) => (
          <MenuItem key={opt.value} onClick={() => handleSelect(opt.value)}>
            {opt.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

const ListPage = () => {
  const ads = useSelector((state) => state.ads.ads);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const limit = 10;

  const [filterStatus, setFilterStatus] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterMinPrice, setFilterMinPrice] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const searchRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedAds, setSelectedAds] = useState([]);
  const [bulkRejectReason, setBulkRejectReason] = useState("");
  const [bulkRejectComment, setBulkRejectComment] = useState("");
  const [bulkRejectOpenOther, setBulkRejectOpenOther] = useState(false);

  const isCategorySelected = (val) =>
    !(val === "" || val === null || typeof val === "undefined");

  const [appliedFilters, setAppliedFilters] = useState({
    status: [],
    categoryId: "",
    minPrice: "",
    maxPrice: "",
    search: "",
  });

  const isFiltersEmpty =
    filterStatus.length === 0 &&
    !isCategorySelected(filterCategory) &&
    filterMinPrice === "" &&
    filterMaxPrice === "" &&
    filterSearch.trim() === "";

  const loadAds = async (params = {}) => {
    try {
      setLoading(true);
      const data = await fetchAds(params);
      dispatch(setAds(data.ads || []));
      if (data.pagination) {
        setTotalCount(data.pagination.totalItems);
        setPage(data.pagination.currentPage);
      }
    } catch (e) {
      console.error("Ошибка загрузки:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const status = searchParams.getAll("status");
    const categoryId = searchParams.get("categoryId") || "";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const search = searchParams.get("search") || "";
    const sortByParam = searchParams.get("sortBy") || "";
    const sortOrderParam = searchParams.get("sortOrder") || "asc";

    setFilterStatus(status);
    setFilterCategory(categoryId);
    setFilterMinPrice(minPrice);
    setFilterMaxPrice(maxPrice);
    setFilterSearch(search);
    setSortBy(sortByParam);
    setSortOrder(sortOrderParam);

    setAppliedFilters({
      status,
      categoryId,
      minPrice,
      maxPrice,
      search,
    });
  }, []);

  const applyFilters = async () => {
    const params = { page: 1, limit };
    if (filterStatus && filterStatus.length > 0) params.status = filterStatus;
    if (isCategorySelected(filterCategory)) {
      params.categoryId = Number(filterCategory);
    }
    if (filterMinPrice !== "" && !Number.isNaN(Number(filterMinPrice)))
      params.minPrice = filterMinPrice;
    if (filterMaxPrice !== "" && !Number.isNaN(Number(filterMaxPrice)))
      params.maxPrice = filterMaxPrice;
    if (filterSearch && filterSearch.trim() !== "")
      params.search = filterSearch.trim();

    const urlParams = {};
    if (filterStatus.length > 0) urlParams.status = filterStatus;
    if (isCategorySelected(filterCategory))
      urlParams.categoryId = filterCategory;
    if (filterMinPrice) urlParams.minPrice = filterMinPrice;
    if (filterMaxPrice) urlParams.maxPrice = filterMaxPrice;
    if (filterSearch) urlParams.search = filterSearch.trim();
    if (sortBy) {
      urlParams.sortBy = sortBy;
      urlParams.sortOrder = sortOrder;
    }
    setSearchParams(urlParams);

    setAppliedFilters({
      status: filterStatus,
      categoryId: filterCategory,
      minPrice: filterMinPrice,
      maxPrice: filterMaxPrice,
      search: filterSearch,
    });

    setPage(1);
    await loadAds({ ...params, sortBy, sortOrder });
  };

  const resetFilters = async () => {
    setFilterStatus([]);
    setFilterCategory("");
    setFilterMinPrice("");
    setFilterMaxPrice("");
    setFilterSearch("");
    setAppliedFilters({
      status: [],
      categoryId: "",
      minPrice: "",
      maxPrice: "",
      search: "",
    });
    setSearchParams({});
    setPage(1);
    await loadAds({ page: 1, limit, sortBy, sortOrder });
  };

  useEffect(() => {
    (async () => {
      await loadAds({ page, limit, sortBy, sortOrder });
    })();
  }, []);

  useEffect(() => {
    if (isFiltersEmpty) {
      (async () => {
        await loadAds({ page: 1, limit, sortBy, sortOrder });
      })();
    }
  }, [isFiltersEmpty]);

  useEffect(() => {
    (async () => {
      const params = {
        page,
        limit,
        ...appliedFilters,
        ...(sortBy ? { sortBy, sortOrder } : {}),
      };
      await loadAds(params);
    })();
  }, [page, sortBy, sortOrder]);

  const toggleSelectAd = (adId) => {
    setSelectedAds((prev) =>
      prev.includes(adId) ? prev.filter((id) => id !== adId) : [...prev, adId]
    );
  };

  const approveSelectedAds = async () => {
    if (selectedAds.length === 0) return;
    try {
      for (let id of selectedAds) {
        const updated = await approveAd(id);
        dispatch(updateAd(updated.ad || updated));
      }
      setSelectedAds([]);
      await loadAds({ page, limit, sortBy, sortOrder, ...appliedFilters });
    } catch (e) {
      console.error("Ошибка массового одобрения", e);
    }
  };

  const rejectSelectedAds = async () => {
    if (selectedAds.length === 0 || !bulkRejectReason) return;
    try {
      for (let id of selectedAds) {
        const payload = { reason: bulkRejectReason };
        if (bulkRejectReason === "Другое") payload.comment = bulkRejectComment;
        const updated = await rejectAd(id, payload);
        dispatch(updateAd(updated.ad || updated));
      }
      setSelectedAds([]);
      setBulkRejectReason("");
      setBulkRejectComment("");
      setBulkRejectOpenOther(false);
      await loadAds({ page, limit, sortBy, sortOrder, ...appliedFilters });
    } catch (e) {
      console.error("Ошибка массового отклонения", e);
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

      if (e.key === "/" || e.key === ".") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (loading) return <LinearProgress sx={{ width: "100%", mt: 2 }} />;

  return (
    <PageWrapper>
      <Box>
        <Typography variant="h4" mb={2}>
          Список объявлений
        </Typography>

        <Box
          mb={3}
          sx={{
            border: "1px solid #e6e6e6",
            borderRadius: 2,
            p: 2,
            display: "flex",
            alignItems: "start",
            flexDirection: "column",
          }}
        >
          <SortControl
            sortBy={sortBy}
            sortOrder={sortOrder}
            setSortBy={setSortBy}
            setSortOrder={setSortOrder}
          />

          <Grid
            container
            spacing={2}
            alignItems="center"
            sx={{ "& .MuiFormControl-root": { minWidth: 200 } }}
          >
            <Box>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} mb={1}>
                <FormControl fullWidth size="small">
                  <InputLabel>Статус</InputLabel>
                  <Select
                    multiple
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    input={<OutlinedInput label="Статус" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.3 }}>
                        {selected.map((value) => {
                          const label = statuses.find(
                            (s) => s.value === value
                          )?.label;
                          return (
                            <Chip key={value} label={label} size="small" />
                          );
                        })}
                      </Box>
                    )}
                    MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}
                  >
                    {statuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} mb={1}>
                <FormControl fullWidth size="small">
                  <InputLabel>Категория</InputLabel>
                  <Select
                    value={filterCategory}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFilterCategory(v === "" ? "" : Number(v));
                    }}
                    label="Категория"
                    MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}
                  >
                    <MenuItem value="">
                      <em>Все</em>
                    </MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} mb={1}>
                <TextField
                  type="number"
                  size="small"
                  label="Мин. цена"
                  value={filterMinPrice}
                  onChange={(e) => setFilterMinPrice(e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} mb={1}>
                <TextField
                  type="number"
                  size="small"
                  label="Макс. цена"
                  value={filterMaxPrice}
                  onChange={(e) => setFilterMaxPrice(e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} mb={1}>
                <TextField
                  label="Поиск"
                  size="small"
                  value={filterSearch}
                  inputRef={searchRef}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  fullWidth
                />
              </Grid>
            </Box>
            <Box sx={{ alignSelf: "end" }}>
              <Grid size={{ xs: 12, md: 12 }} textAlign="right">
                <Box sx={{ display: "inline-flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={applyFilters}
                    disabled={isFiltersEmpty || loading}
                  >
                    Применить
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    onClick={resetFilters}
                  >
                    Сбросить
                  </Button>
                </Box>
              </Grid>
            </Box>
            <Box sx={{ alignSelf: "end" }}>
              {selectedAds.length > 0 && (
                <Box
                  mb={2}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography>Выбрано: {selectedAds.length}</Typography>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={approveSelectedAds}
                  >
                    Одобрить выбранные
                  </Button>
                  <FormControl size="small" sx={{ width: "200px" }}>
                    <InputLabel>Причина отклонения</InputLabel>
                    <Select
                      value={bulkRejectReason}
                      onChange={(e) => {
                        setBulkRejectReason(e.target.value);
                        setBulkRejectOpenOther(e.target.value === "Другое");
                      }}
                      label="Причина отклонения"
                    >
                      <MenuItem value="Запрещённый товар">
                        Запрещённый товар
                      </MenuItem>
                      <MenuItem value="Неверная категория">
                        Неверная категория
                      </MenuItem>
                      <MenuItem value="Некорректное описание">
                        Некорректное описание
                      </MenuItem>
                      <MenuItem value="Проблемы с фото">
                        Проблемы с фото
                      </MenuItem>
                      <MenuItem value="Подозрение на мошенничество">
                        Подозрение на мошенничество
                      </MenuItem>
                      <MenuItem value="Другое">Другое</MenuItem>
                    </Select>
                  </FormControl>
                  {bulkRejectOpenOther && (
                    <TextField
                      size="small"
                      label="Причина (другое)"
                      value={bulkRejectComment}
                      onChange={(e) => setBulkRejectComment(e.target.value)}
                    />
                  )}
                  <Button
                    variant="contained"
                    color="error"
                    onClick={rejectSelectedAds}
                    disabled={
                      !bulkRejectReason ||
                      (bulkRejectReason === "Другое" && !bulkRejectComment)
                    }
                  >
                    Отклонить выбранные
                  </Button>
                </Box>
              )}
            </Box>
          </Grid>
        </Box>

        <Grid container spacing={2} direction="column">
          {ads.map((ad) => (
            <Grid key={ad.id} sx={{ position: "relative" }}>
              <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}>
                <input
                  type="checkbox"
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                  checked={selectedAds.includes(ad.id)}
                  onChange={() => toggleSelectAd(ad.id)}
                />
              </Box>
              <Card
                sx={{
                  display: "flex",
                  width: "100%",
                  minHeight: 150,
                  position: "relative",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
                  <CardMedia
                    component="img"
                    sx={{
                      width: 150,
                      height: 150,
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                    image={
                      "https://placehold.co/300x200/cccccc/969696?text=Image"
                    }
                    alt={ad.title}
                  />
                </Box>

                <CardContent
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    pr: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {ad.title}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      {ad.price} ₽
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        mt: 0.5,
                        flexWrap: "wrap",
                        flexDirection: "column",
                      }}
                    >
                      <Box sx={{ display: "flex", flexDirection: "row" }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Статус:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            ml: "4px",
                            color:
                              ad.status === "pending"
                                ? "#FFB800"
                                : ad.status === "approved"
                                  ? "#4CAF50"
                                  : "#F44336",
                          }}
                        >
                          {ad.status === "pending"
                            ? "на модерации"
                            : ad.status === "approved"
                              ? "одобрено"
                              : "отклонено"}
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary">
                        Приоритет:{" "}
                        {ad.priority === "normal" ? "обычный" : "срочный"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{ display: "flex", alignItems: "center", mt: 1, pr: 1 }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      mr="20px"
                    >
                      {ad.category}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(ad.createdAt).toLocaleDateString("ru-RU")}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
                  >
                    <Button
                      onClick={() => navigate(`/item/${ad.id}`)}
                      variant="contained"
                      size="medium"
                      color="success"
                    >
                      Открыть
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {ads.length === 0 ? (
          <Typography textAlign="center" mt={2}>
            Объявления не найдены
          </Typography>
        ) : (
          <>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="right"
              mt={2}
            >
              Показано {(page - 1) * limit + 1}–
              {Math.min(page * limit, totalCount)} из {totalCount} объявлений
            </Typography>

            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                count={Math.ceil(totalCount / limit)}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          </>
        )}
      </Box>
    </PageWrapper>
  );
};

export default ListPage;
