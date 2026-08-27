import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAuth } from "../context/AuthContext";
import apiClient from "../utils/apiClient";
import booksApi from "../redux/features/books/booksApi";
import { fetchAdminOverview, fetchAdminUsers } from "../redux/features/admin/adminSlice";

const getDocumentUrl = (bookId) => `/api/books/${bookId}/document`;

export const useBookAccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useAuth();

  const handleBookAccess = async ({ book, onRent }) => {
    if (!currentUser) {
      navigate("/login", { state: { from: { pathname: `/books/${book._id}` } } });
      return;
    }

    if (book.sellerId === currentUser.id) {
      window.open(getDocumentUrl(book._id), "_blank");
      return;
    }

    if (book.isFree) {
      window.open(getDocumentUrl(book._id), "_blank");
      try {
        await apiClient.post(`/api/orders/instant/${book._id}`);
        dispatch(booksApi.util.invalidateTags(["Books"]));
        if (currentUser?.role === "admin") {
          dispatch(fetchAdminOverview());
          dispatch(fetchAdminUsers());
        }
      } catch (error) {
        if (error?.response?.status !== 409) {
          console.warn("Failed to register free rental", error);
        }
      }
      return;
    }

    onRent();
  };

  return { handleBookAccess };
};
