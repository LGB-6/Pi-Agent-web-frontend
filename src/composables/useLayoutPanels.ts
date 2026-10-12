import { ref } from "vue";

/** 三栏布局的展开状态。 */

const sidebarOpen = ref(true);
const rightPanelOpen = ref(true);

export function useLayoutPanels() {
  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value;
  }

  function toggleRightPanel() {
    rightPanelOpen.value = !rightPanelOpen.value;
  }

  function closeRightPanel() {
    rightPanelOpen.value = false;
  }

  return {
    sidebarOpen,
    rightPanelOpen,
    toggleSidebar,
    toggleRightPanel,
    closeRightPanel,
  };
}
