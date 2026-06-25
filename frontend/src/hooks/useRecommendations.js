import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import recommendationService from '../services/recommendationService';
import toast from 'react-hot-toast';

export const useRecommendations = () => {
  const queryClient = useQueryClient();

  // Query for recommendation history
  const historyQuery = useQuery({
    queryKey: ['recommendation-history'],
    queryFn: recommendationService.getHistory,
  });

  // Query for saved universities
  const savedQuery = useQuery({
    queryKey: ['saved-universities'],
    queryFn: recommendationService.getSavedUniversities,
  });

  // Mutation for getting new recommendations
  const getRecommendationsMutation = useMutation({
    mutationFn: recommendationService.getRecommendations,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendation-history'] });
      toast.success('Recommendations generated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to generate recommendations');
    },
  });

  // Mutation for saving a university
  const saveUniversityMutation = useMutation({
    mutationFn: recommendationService.saveUniversity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-universities'] });
      toast.success('University bookmarked!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to save university');
    },
  });

  // Mutation for removing a saved university
  const unsaveUniversityMutation = useMutation({
    mutationFn: recommendationService.unsaveUniversity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-universities'] });
      toast.success('Removed from bookmarks');
    },
    onError: () => {
      toast.error('Failed to remove bookmark');
    },
  });

  // Fetch full session details — returns student_profile (all form inputs) + universities
  const getSessionDetails = async (sessionId) => {
    return await recommendationService.getSessionDetails(sessionId);
  };

  return {
    history: historyQuery.data || [],
    isLoadingHistory: historyQuery.isLoading,
    saved: savedQuery.data || [],
    isLoadingSaved: savedQuery.isLoading,
    getRecommendations: getRecommendationsMutation.mutateAsync,
    isGenerating: getRecommendationsMutation.isPending,
    saveUniversity: saveUniversityMutation.mutate,
    isSaving: saveUniversityMutation.isPending,
    unsaveUniversity: unsaveUniversityMutation.mutate,
    getSessionDetails,
  };
};
