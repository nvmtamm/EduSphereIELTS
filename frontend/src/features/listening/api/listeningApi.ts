import { apiClient } from '@/shared/lib/axios';
import type {
  ListeningTest,
  ListeningTestDetail,
  ListeningResult,
  ListeningHistoryItem,
  PagedList,
  ListeningFilterParams,
  SubmitListeningExamRequest
} from '../types/listening';

export const listeningApi = {
  getTests: async (params?: ListeningFilterParams): Promise<PagedList<ListeningTest>> => {
    const res = await apiClient.get<PagedList<ListeningTest>>('/listening/tests', { params });
    return res.data;
  },

  getTestById: async (id: string): Promise<ListeningTestDetail> => {
    const res = await apiClient.get<ListeningTestDetail>(`/listening/tests/${id}`);
    return res.data;
  },

  submitExam: async (testId: string, payload: SubmitListeningExamRequest): Promise<ListeningResult> => {
    const res = await apiClient.post<ListeningResult>(`/listening/tests/${testId}/submit`, payload);
    return res.data;
  },

  getSubmissionById: async (id: string): Promise<ListeningResult> => {
    const res = await apiClient.get<ListeningResult>(`/listening/submissions/${id}`);
    return res.data;
  },

  getHistory: async (): Promise<ListeningHistoryItem[]> => {
    const res = await apiClient.get<ListeningHistoryItem[]>('/listening/history');
    return res.data;
  }
};
