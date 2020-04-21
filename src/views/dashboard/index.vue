<template>
  <div class="dashboard-container">
    <editorDashboard />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import editorDashboard from './editor'

export default {
  name: 'Dashboard',
  components: { editorDashboard },
  data() {
    return {
      currentRole: 'adminDashboard'
    }
  },
  computed: {
    ...mapGetters([
      'roles'
    ])
  }
}
</script>
