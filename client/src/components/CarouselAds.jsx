import React, { useState } from "react";
import { Box, IconButton, CardMedia, Typography } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

const CarouselAds = ({ images = [] }) => {
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) {
    return <Typography>Изображений нет</Typography>;
  }

  const prev = () => {
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const next = () => {
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  return (
    <Box sx={{ position: "relative", width: "100%", height: 340 }}>
      <CardMedia
        component="img"
        image={images[index]}
        alt={`image-${index}`}
        sx={{
          width: "100%",
          height: "100%",
          borderRadius: 1,
          objectFit: "cover",
        }}
      />

      
      <IconButton
        onClick={prev}
        sx={{
          position: "absolute",
          top: "50%",
          left: 10,
          transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.3)",
          color: "white",
          "&:hover": { background: "rgba(0,0,0,0.5)" },
        }}
      >
        <ArrowBack />
      </IconButton>

      <IconButton
        onClick={next}
        sx={{
          position: "absolute",
          top: "50%",
          right: 10,
          transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.3)",
          color: "white",
          "&:hover": { background: "rgba(0,0,0,0.5)" },
        }}
      >
        <ArrowForward />
      </IconButton>

      <Box
        sx={{
          position: "absolute",
          bottom: 10,
          width: "100%",
          textAlign: "center",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            background: "rgba(0,0,0,0.5)",
            color: "white",
            px: 1,
            py: 0.2,
            borderRadius: 1,
          }}
        >
          {index + 1} / {images.length}
        </Typography>
      </Box>
    </Box>
  );
};

export default CarouselAds;