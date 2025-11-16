import { motion } from "framer-motion";

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 0 }}   
      animate={{ opacity: 1, x: 0 }}    
      exit={{ opacity: 0, x: 0 }}    
      transition={{ duration: 0.2 }}    
      style={{ width: "100%" }}
    >
      {children}
    </motion.div>
  );
};

export default PageWrapper;
