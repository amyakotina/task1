// src/store/slices/categoriesSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import { ICategory, ICreateCategoryPayload, IUpdateCategoryPayload, IApiError, RootState } from '../../types'; // 👈 ДОБАВЛЯЕМ
import { addLocalNotification } from './notificationsSlice';

interface CategoriesState {
  categories: ICategory[];
  loading: boolean;
}

interface IFetchCategoriesResponse {
  status: number;
  categories: ICategory[];
}

interface ICategoryResponse {
  status: number;
  message: string;
  category: ICategory;
}

const initialState: CategoriesState = {
  categories: [],
  loading: false,
};

// GET
export const fetchCategories = createAsyncThunk<
  ICategory[],
  void,
  { rejectValue: IApiError }
>(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<IFetchCategoriesResponse>('/categories');
      console.log(`📁 Получено ${response.data.categories.length} категорий`);
      return response.data.categories;
    } catch (error) {
      return rejectWithValue(error as IApiError);
    }
  }
);

// POST
export const createCategory = createAsyncThunk<
  ICategory,
  ICreateCategoryPayload,
  { rejectValue: IApiError }
>(
  'categories/createCategory',
  async ({ name, color }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post<ICategoryResponse>('/categories', { name, color });
      console.log(`✅ Категория "${name}" создана`);
      
      dispatch(addLocalNotification({
        type: 'success',
        message: `🏷️ Категория "${name}" создана!`
      }));
      
      return response.data.category;
    } catch (error) {
      return rejectWithValue(error as IApiError);
    }
  }
);

// PUT
export const updateCategory = createAsyncThunk<
  ICategory,
  IUpdateCategoryPayload,
  { rejectValue: IApiError }
>(
  'categories/updateCategory',
  async ({ categoryId, name, color }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.put<ICategoryResponse>(`/categories/${categoryId}`, { name, color });
      console.log(`✏️ Категория обновлена`);
      
      dispatch(addLocalNotification({
        type: 'info',
        message: `✏️ Категория "${name}" обновлена`
      }));
      
      return response.data.category;
    } catch (error) {
      return rejectWithValue(error as IApiError);
    }
  }
);

// DELETE
export const deleteCategory = createAsyncThunk<
  number,
  number,
  { rejectValue: IApiError; state: RootState }
>(
  'categories/deleteCategory',
  async (categoryId, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState();
      const category = state.categories.categories.find((c: ICategory) => c.id === categoryId);
      const categoryName = category?.name || 'Категория';
      
      await api.delete(`/categories/${categoryId}`);
      console.log(`🗑️ Категория "${categoryName}" удалена`);
      
      dispatch(addLocalNotification({
        type: 'warning',
        message: `🗑️ Категория "${categoryName}" удалена`
      }));
      
      return categoryId;
    } catch (error) {
      return rejectWithValue(error as IApiError);
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(c => c.id !== action.payload);
      });
  },
});

export default categoriesSlice.reducer;