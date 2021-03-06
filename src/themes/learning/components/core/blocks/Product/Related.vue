<template>
  <section
    class="pt20 pb50 new-collection bg-cl-secondary px15"
    v-if="getCurrentRelatedProducts.length"
  >
    <div class="container">
      <div>
        <header class="col-md-12">
          <h3 class="my30">
            {{ heading }}
          </h3>
        </header>
      </div>
      <product-slider
        columns="4"
        :products="getCurrentRelatedProducts"
        :config="sliderConfig"
      />
    </div>
  </section>
</template>

<script>
import ProductSlider from 'theme/components/core/ProductsSlider'
import { mapGetters } from 'vuex'
import { prepareRelatedQuery } from '@vue-storefront/core/modules/catalog/queries/related'
import i18n from '@vue-storefront/i18n'
import config from 'config'

export default {
  name: 'Related',
  props: {
    type: {
      type: String,
      required: true
    },
    heading: {
      type: String,
      required: false,
      default: i18n.t('Similar products')
    }
  },
  data () {
    return {
      sliderConfig: {
        perPage: 1,
        perPageCustom: [[576, 2], [1024, 4]],
        paginationEnabled: true,
        loop: true
      }
    }
  },
  components: {
    ProductSlider
  },
  beforeMount () {
    this.$bus.$on('product-after-load', this.refreshList)

    if (config.usePriceTiers) {
      this.$bus.$on('user-after-loggedin', this.refreshList)
      this.$bus.$on('user-after-logout', this.refreshList)
    }

    this.refreshList()
  },
  beforeDestroy () {
    if (config.usePriceTiers) {
      this.$bus.$off('user-after-loggedin', this.refreshList)
      this.$bus.$off('user-after-logout', this.refreshList)
    }
  },
  destroyed () {
    this.$bus.$off('product-after-load', this.refreshList)
  },
  methods: {
    async refreshList () {
      let sku = this.productLinks ? this.productLinks
        .filter(pl => pl.link_type === this.type)
        .map(pl => pl.linked_product_sku) : null

      let key = 'sku'
      if (sku === null || (sku.length === 0)) {
        sku = this.getCurrentProduct.category_ids
        key = 'category_ids'
      }
      let relatedProductsQuery = prepareRelatedQuery(key, sku)

      const { items } = await this.$store.dispatch('product/findProducts', {
        query: relatedProductsQuery,
        size: 8,
        options: {
          populateRequestCacheTags: false,
          prefetchGroupProducts: false
        }
      })
      if (items.length) {
        this.$store.dispatch('product/related', {
          key: this.type,
          items: items
        })
        this.$forceUpdate()
      }
    }
  },
  computed: {
    ...mapGetters({
      getProductRelated: 'product/getProductRelated',
      getCurrentProduct: 'product/getCurrentProduct'
    }),
    getCurrentRelatedProducts () {
      return this.getProductRelated[this.type] || []
    },
    productLinks () {
      return this.getCurrentProduct.product_links
    }
  }
}
</script>
