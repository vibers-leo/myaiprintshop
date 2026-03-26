import { useState, useEffect } from 'react';

const STORAGE_KEY = 'goodzz_search_history';
const MAX_HISTORY = 10;

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  // 로컬스토리지에서 검색 기록 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error('검색 기록 로드 실패:', error);
    }
  }, []);

  // 검색어 추가
  const addSearch = (query: string) => {
    if (!query || query.trim() === '') return;

    const trimmedQuery = query.trim();

    setHistory(prev => {
      // 중복 제거 후 최신 검색어를 앞에 추가
      const filtered = prev.filter(item => item !== trimmedQuery);
      const newHistory = [trimmedQuery, ...filtered].slice(0, MAX_HISTORY);

      // 로컬스토리지에 저장
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('검색 기록 저장 실패:', error);
      }

      return newHistory;
    });
  };

  // 특정 검색어 삭제
  const removeSearch = (query: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(item => item !== query);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('검색 기록 삭제 실패:', error);
      }

      return newHistory;
    });
  };

  // 전체 기록 삭제
  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('검색 기록 전체 삭제 실패:', error);
    }
  };

  return {
    history,
    addSearch,
    removeSearch,
    clearHistory,
  };
}
