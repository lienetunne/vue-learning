<template>
  <div id="product">
    <section class="bg-cl-secondary px20 product-top-section">
      <div class="container">
        <section class="row m0 between-xs">
          <div class="col-xs-12 col-md-6 center-xs middle-xs image">
            <product-gallery
              :offline="getOfflineImage"
              :gallery="getProductGallery"
              :configuration="getCurrentProductConfiguration"
              :product="getCurrentProduct"
            />
          </div>
          <div class="col-xs-12 col-md-6 pl20 pr10 data">
            <breadcrumbs
              class="pt50 mt10 pb15 hidden-xs"
            />
            <h1
              class="mb10 mt0 cl-mine-shaft product-name"
              data-testid="productName"
            >
              {{ getCurrentProduct.name | htmlDecode }}
              <web-share
                :title="getCurrentProduct.name | htmlDecode"
                text="Check this product!"
                class="web-share"
              />
            </h1>
            <div>
              <product-price
                class="pb20 mb0"
                v-if="getCurrentProduct.type_id !== 'grouped'"
                :product="getCurrentProduct"
                :custom-options="getCurrentCustomOptions"
              />
            </div>
            <section class="container p0 pt0 mb15 cl-accent details">
              <div class="h4 details-wrapper" :class="{'details-wrapper--open': detailsOpen}">
                <div class="row between-md m0">
                  <div class="lh30 h5" v-html="getCurrentProduct.description" />
                  <div class="col-md-12">
                    <ul class="attributes p0 pt5 m0">
                      <product-attribute
                        :key="attr.attribute_code"
                        v-for="attr in getCustomAttributes"
                        :product="getCurrentProduct"
                        :attribute="attr"
                        empty-placeholder="N/A"
                      />
                    </ul>
                  </div>
                  <div class="details-overlay" @click="showDetails" />
                </div>
              </div>
            </section>

            <div class="row mb15 m0 p0 shipping-block">
              <cms-block :identifier="'shipping-block'" />
            </div>

            <product-links
              v-if="getCurrentProduct.type_id =='grouped'"
              :products="getCurrentProduct.product_links"
            />
            <product-bundle-options
              v-if="getCurrentProduct.bundle_options && getCurrentProduct.bundle_options.length > 0"
              :product="getCurrentProduct"
            />
            <product-custom-options
              v-else-if="getCurrentProduct.custom_options && getCurrentProduct.custom_options.length > 0"
              :product="getCurrentProduct"
            />
            <div class="row m0 p0">
              <div class="w-auto border-box p0 cl-primary variants" v-if="getCurrentProduct.type_id =='configurable'">
                <div
                  class="error"
                  v-if="getCurrentProduct.errors && Object.keys(getCurrentProduct.errors).length > 0"
                >
                  {{ getCurrentProduct.errors | formatProductMessages }}
                </div>
                <div class="h5" v-for="option in getProductOptions" :key="option.id">
                  <div class="row top-xs m0 pt0 pb10 variants-wrapper">
                    <div v-if="option.label == 'Color'">
                      <div class="variants-label pb10" data-testid="variantsLabel">
                        {{ 'Choose color' }}
                      </div>
                      <color-selector
                        v-for="filter in getAvailableFilters[option.attribute_code]"
                        :key="filter.id"
                        :variant="filter"
                        :selected-filters="getSelectedFilters"
                        @change="changeFilter"
                      />
                    </div>
                    <div class="sizes" v-else-if="option.label == 'Size'">
                      <size-selector
                        class="mr10 mb10"
                        v-for="filter in getAvailableFilters[option.attribute_code]"
                        :key="filter.id"
                        :variant="filter"
                        :selected-filters="getSelectedFilters"
                        @change="changeFilter"
                      />
                    </div>
                    <div :class="option.attribute_code" v-else>
                      <generic-selector
                        class="mr10 mb10"
                        v-for="filter in getAvailableFilters[option.attribute_code]"
                        :key="filter.id"
                        :variant="filter"
                        :selected-filters="getSelectedFilters"
                        @change="changeFilter"
                      />
                    </div>
                    <span
                      v-if="option.label == 'Size'"
                      @click="openSizeGuide"
                      class="p0 ml30 inline-flex middle-xs no-underline h5 action size-guide pointer cl-secondary"
                    >
                      <i class="pr5 material-icons">accessibility</i>
                      <span>{{ $t('Size guide') }}</span>
                    </span>
                  </div>
                </div>
              </div>

              <product-qty-increment
                :name="$t('Quantity')"
                :min="1"
                v-model="getCurrentProduct.qty"
                :product="getCurrentProduct"
                :validations="[
                  {
                    condition: getCurrentProduct.qty.$error || !getCurrentProduct.qty.minValue
                  }
                ]"
              />
            </div>

            <div class="row m0 pb50">
              <add-to-cart
                :product="getCurrentProduct"
                :disabled="isAddToCartDisabled"
                class="col-md"
              />
              <AddToCompare :product="getCurrentProduct" />
              <AddToWishlist :product="getCurrentProduct" />
              <div />
            </div>
          </div>
        </section>
      </div>
    </section>
    <lazy-hydrate when-idle>
      <new-related-products type="related" />
    </lazy-hydrate>
    <lazy-hydrate when-idle>
      <related-products type="upsell" :heading="$t('We found other products you might like')" />
    </lazy-hydrate>

    <SizeGuide />
    <script v-html="getJsonLd" type="application/ld+json" />
  </div>
</template>

<script>
import i18n from '@vue-storefront/i18n'
import VueOfflineMixin from 'vue-offline/mixin'
import config from 'config'
import RelatedProducts from 'theme/components/core/blocks/Product/Related.vue'
import AddToCart from 'theme/components/core/AddToCart.vue'
import GenericSelector from 'theme/components/core/GenericSelector'
import ColorSelector from 'theme/components/core/ColorSelector.vue'
import SizeSelector from 'theme/components/core/SizeSelector.vue'
import Breadcrumbs from 'theme/components/core/Breadcrumbs.vue'
import ProductAttribute from 'theme/components/core/ProductAttribute.vue'
import ProductLinks from 'theme/components/core/ProductLinks.vue'
import ProductCustomOptions from 'theme/components/core/ProductCustomOptions.vue'
import ProductBundleOptions from 'theme/components/core/ProductBundleOptions.vue'
import ProductGallery from 'theme/components/core/ProductGallery'
import Spinner from 'theme/components/core/Spinner'
import focusClean from 'theme/components/theme/directives/focusClean'
import WebShare from 'theme/components/theme/WebShare'
import BaseInputNumber from 'theme/components/core/blocks/Form/BaseInputNumber'
import SizeGuide from 'theme/components/core/blocks/Product/SizeGuide'
import AddToWishlist from 'theme/components/core/blocks/Wishlist/AddToWishlist'
import AddToCompare from 'theme/components/core/blocks/Compare/AddToCompare'
import { mapGetters } from 'vuex'
import LazyHydrate from 'vue-lazy-hydration'
import { ProductOption } from '@vue-storefront/core/modules/catalog/components/ProductOption.ts'
import { getAvailableFiltersByProduct, getSelectedFiltersByProduct } from '@vue-storefront/core/modules/catalog/helpers/filters'
import { isOptionAvailableAsync } from '@vue-storefront/core/modules/catalog/helpers/index'
import { localizedRoute, currentStoreView } from '@vue-storefront/core/lib/multistore'
import { htmlDecode } from '@vue-storefront/core/filters'
import { ReviewModule } from '@vue-storefront/core/modules/review'
import { RecentlyViewedModule } from '@vue-storefront/core/modules/recently-viewed'
import { registerModule, isModuleRegistered } from '@vue-storefront/core/lib/modules'
import { onlineHelper, isServer, productJsonLd } from '@vue-storefront/core/helpers'
import { catalogHooksExecutors } from '@vue-storefront/core/modules/catalog-next/hooks'
import ProductPrice from 'theme/components/core/ProductPrice.vue'
import { doPlatformPricesSync } from '@vue-storefront/core/modules/catalog/helpers'
import { filterChangedProduct } from '@vue-storefront/core/modules/catalog/events'
import ProductQtyIncrement from 'theme/components/core/blocks/ProductQtyIncrement.vue'
import CmsBlock from 'theme/components/core/blocks/Cms/Block'
import NewRelatedProducts from 'theme/components/core/blocks/Product/RelatedProducts.vue'

export default {
  components: {
    AddToCart,
    AddToCompare,
    AddToWishlist,
    Breadcrumbs,
    ColorSelector,
    GenericSelector,
    ProductAttribute,
    ProductBundleOptions,
    ProductCustomOptions,
    ProductGallery,
    ProductLinks,
    RelatedProducts,
    SizeSelector,
    WebShare,
    SizeGuide,
    LazyHydrate,
    ProductPrice,
    ProductQtyIncrement,
    CmsBlock,
    NewRelatedProducts
  },
  mixins: [ProductOption],
  directives: { focusClean },
  beforeCreate () {
    registerModule(ReviewModule)
    registerModule(RecentlyViewedModule)
  },
  data () {
    return {
      detailsOpen: false,
      maxQuantity: 0,
      quantityError: false,
      isStockInfoLoading: false,
      hasAttributesLoaded: false,
      manageQuantity: true
    }
  },
  computed: {
    ...mapGetters({
      getCurrentCategory: 'category-next/getCurrentCategory',
      getCurrentProduct: 'product/getCurrentProduct',
      getProductGallery: 'product/getProductGallery',
      getCurrentProductConfiguration: 'product/getCurrentProductConfiguration',
      attributesByCode: 'attribute/attributeListByCode',
      getCurrentCustomOptions: 'product/getCurrentCustomOptions'
    }),
    getOptionLabel () {
      return (option) => {
        const configName = option.attribute_code ? option.attribute_code : option.label.toLowerCase()
        return this.getCurrentProductConfiguration[configName] ? this.getCurrentProductConfiguration[configName].label : configName
      }
    },
    isOnline (value) {
      return onlineHelper.isOnline
    },
    getProductOptions () {
      if (
        this.getCurrentProduct.errors &&
        Object.keys(this.getCurrentProduct.errors).length &&
        Object.keys(this.getCurrentProductConfiguration).length
      ) {
        return []
      }
      return this.getCurrentProduct.configurable_options
    },
    getOfflineImage () {
      return {
        src: this.getThumbnail(this.getCurrentProduct.image, config.products.thumbnails.width, config.products.thumbnails.height),
        error: this.getThumbnail(this.getCurrentProduct.image, config.products.thumbnails.width, config.products.thumbnails.height),
        loading: this.getThumbnail(this.getCurrentProduct.image, config.products.thumbnails.width, config.products.thumbnails.height)
      }
    },
    getCustomAttributes () {
      return Object.values(this.attributesByCode || [])
        .filter(
          a => a.is_visible && a.is_user_defined && (parseInt(a.is_visible_on_front) || a.is_visible_on_front === true) && this.getCurrentProduct[a.attribute_code]
        )
        .sort((a, b) => { return a.attribute_id > b.attribute_id })
    },
    getAvailableFilters () {
      return getAvailableFiltersByProduct(this.getCurrentProduct)
    },
    getSelectedFilters () {
      return getSelectedFiltersByProduct(this.getCurrentProduct, this.getCurrentProductConfiguration)
    },
    isSimpleOrConfigurable () {
      return ['simple', 'configurable'].includes(this.getCurrentProduct.type_id)
    },
    isAddToCartDisabled () {
      if (this.quantityError || this.isStockInfoLoading) {
        return false
      }

      return this.isOnline && !this.maxQuantity && this.manageQuantity && this.isSimpleOrConfigurable
    },
    storeView () {
      return currentStoreView()
    },
    getJsonLd () {
      return productJsonLd(this.getCurrentProduct, this.getCurrentProductConfiguration.color && this.getCurrentProductConfiguration.color.label, this.$store.state.storeView.i18n.currencyCode, this.getCustomAttributes)
    }
  },
  async mounted () {
    await this.$store.dispatch('recently-viewed/addItem', this.getCurrentProduct)
  },
  async asyncData ({ store, route, context }) {
    if (context) context.output.cacheTags.add('product')
    const product = await store.dispatch('product/loadProduct', { parentSku: route.params.parentSku, childSku: route && route.params && route.params.childSku ? route.params.childSku : null })
    const loadBreadcrumbsPromise = store.dispatch('product/loadProductBreadcrumbs', { product })
    if (isServer) await loadBreadcrumbsPromise
    catalogHooksExecutors.productPageVisited(product)
  },
  beforeRouteEnter (to, from, next) {
    if (isServer) {
      next()
    } else {
      next((vm) => {
        vm.getQuantity()
      })
    }
  },
  watch: {
    isOnline: {
      handler (isOnline) {
        if (isOnline) {
          this.getQuantity()
        }
      }
    }
  },
  methods: {
    showDetails (event) {
      this.detailsOpen = true
      event.target.classList.add('hidden')
    },
    notifyOutStock () {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'error',
        message: this.$t(
          'The product is out of stock and cannot be added to the cart!'
        ),
        action1: { label: this.$t('OK') }
      })
    },
    notifyWrongAttributes () {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'warning',
        message: this.$t(
          'No such configuration for the product. Please do choose another combination of attributes.'
        ),
        action1: { label: this.$t('OK') }
      })
    },
    async changeFilter (variant) {
      const selectedConfiguration = Object.assign({ attribute_code: variant.type }, variant)
      await filterChangedProduct(selectedConfiguration, this.$store, this.$router)
      this.getQuantity()
    },
    openSizeGuide () {
      this.$bus.$emit('modal-show', 'modal-sizeguide')
    },
    isOptionAvailable (option) { // check if the option is available
      const currentConfig = Object.assign({}, this.getCurrentProductConfiguration)
      currentConfig[option.type] = option
      return isOptionAvailableAsync(this.$store, { product: this.getCurrentProduct, configuration: currentConfig })
    },
    async getQuantity () {
      if (this.isStockInfoLoading) return // stock info is already loading
      this.isStockInfoLoading = true
      try {
        if (config.products.alwaysSyncPricesClientSide) {
          doPlatformPricesSync([this.getCurrentProduct]);
        }
        const res = await this.$store.dispatch('stock/check', {
          product: this.getCurrentProduct,
          qty: this.getCurrentProduct.qty
        })

        this.manageQuantity = res.isManageStock
        this.maxQuantity = res.isManageStock ? res.qty : null
      } finally {
        this.isStockInfoLoading = false
      }
    },
    handleQuantityError (error) {
      this.quantityError = error
    }
  },
  metaInfo () {
    const storeView = currentStoreView()
    return {
      /* link: [
        { rel: 'amphtml',
          href: this.$router.resolve(localizedRoute({
            name: this.getCurrentProduct.type_id + '-product-amp',
            params: {
              parentSku: this.getCurrentProduct.parentSku ? this.getCurrentProduct.parentSku : this.getCurrentProduct.sku,
              slug: this.getCurrentProduct.slug,
              childSku: this.getCurrentProduct.sku
            }
          }, storeView.storeCode)).href
        }
      ], */
      title: htmlDecode(this.getCurrentProduct.meta_title || this.getCurrentProduct.name),
      meta: this.getCurrentProduct.meta_description ? [{ vmid: 'description', name: 'description', content: htmlDecode(this.getCurrentProduct.meta_description) }] : []
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~theme/css/variables/colors';
@import '~theme/css/helpers/functions/color';
$color-primary: color(primary);
$color-tertiary: color(tertiary);
$color-secondary: color(secondary);
$color-white: color(white);
$bg-secondary: color(secondary, $colors-background);

.product {
  &__add-to-compare {
    display: none;
    @media (min-width: 767px) {
      display: block;
    }
  }
}

.breadcrumbs {
  @media (max-width: 767px) {
    margin: 15px 0;
    padding: 15px 0 0 15px;
  }
}

.error {
  color: red;
  font-weight: bold;
  padding-bottom: 15px;
}
.data {
  @media (max-width: 767px) {
    border-bottom: 1px solid $bg-secondary;
  }
}

.image {
  @media (max-width: 1023px) {
    margin-bottom: 20px;
  }
}

.product-name {
  @media (max-width: 767px) {
    font-size: 36px;
  }
}

.variants-label {
  font-weight: 600;
  color: #333333;
  line-height: 30px;
  font-size: 14px;
}

.variants-wrapper {
  @media (max-width: 767px) {
    padding-bottom: 30px;
  }

  .sizes {
    @media (max-width: 767px) {
      width: 100%;
    }
  }

  .size-guide {
    height: 40px;
    @media (max-width: 767px) {
      width: 100%;
      margin-left: 0;
    }
  }
}

.product-top-section {
  @media (max-width: 767px) {
    padding: 0;
    background-color: $color-white;
  }
}

.add-to-buttons {
  @media (max-width: 767px) {
    padding-top: 30px;
    margin-bottom: 40px;
  }
}

.details {
  border-bottom: solid 1px #E0E0E0;

  @media (max-width: 767px) {
    padding: 50px 15px 15px;
  }
}

.details-title {
  padding: 0 8px;

  @media (max-width: 767px) {
    font-size: 18px;
    margin: 0;
  }
}

.details-wrapper {
  @media (max-width: 767px) {
    position: relative;
    max-height: 140px;
    overflow: hidden;
    transition: all 0.3s ease;
    font-size: 14px;
  }

  &--open {
    max-height: none;
  }
}

.details-overlay {
  @media (max-width: 767px) {
    position: absolute;
    height: 75%;
    bottom: 0;
    left: 0;
    width: 100%;
    margin: 0;
    cursor: pointer;
    background: linear-gradient(rgba($color-white, 0), rgba($color-white, 1));
    &.hidden {
      display: none;
    }
  }
}

.action {
  &:hover {
    color: $color-tertiary;
  }
}

.attributes {
  list-style-type: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.product-image {
  mix-blend-mode: multiply;
  width: 460px;
}

.web-share {
  float: right;
}
</style>

<style lang="scss">
@import '~theme/css/variables/colors';
@import '~theme/css/helpers/functions/color';
$color-white: color(white);
$gainsboro: color(gainsboro);
$light-grey: color(light-grey);
$dark-grey: color(dark-grey);
$mine-shaft: color(mine-shaft);
$green: color(green);

.price {
  border-bottom: solid 1px $gainsboro;

  .h2 {
    color: $green;
  }
}

.breadcrumbs {
  .separator {
    line-height: 1px;
    font-size: 14px;
    margin: 0 15px;
  }
}

.variants-wrapper {
  button.color {
    height: 62px;
    width: 62px;

    .color-inside {
      height: 62px;
      width: 62px;
      border: 0;
    }
  }
}

button.button-full {
  height: 62px;
  align-items: center;
  display: flex;
  justify-content: center;
  max-width: 432px;
  font-weight: 700;

  .material-icons {
    color: $green;
    padding-right: 15px;
  }

  &:hover {
    background-color: $light-grey;
  }

  &:clicked {
    background-color: $dark-grey;
  }
}

button.add-to-compare, button.wishlist {
  height: 62px;
  width: 62px;
  border: 1px solid $gainsboro;
  background: white;
  margin-left: 5px;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    display: none;
  }
}

.shipping-block {
  background-color: $color-white;

  .cms-content {
    width: 100%;

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-wrap: wrap;

      li {
        width: calc(50% - 31px);
        float: left;
        padding: 17px 15px;
        line-height: 24px;

        &:last-child {
          border-left: solid 1px #E0E0E0;
        }

        &:before {
          content: "";
          background-image: url("/assets/icons/ic_delivery.svg");
          background-size: 40px;
          background-position: center;
          background-repeat: no-repeat;
          display: block;
          width: 40px;
          float: left;
          position: relative;
          height: 30px;
          margin: 10px 25px 0 10px;
        }
      }
    }
  }
}

.related-products {
  .product {
    border: solid 1px $gainsboro;
    padding: 30px;

    .product-cover {
      width: 140px;
      height: 140px;
      float: left;
      border: solid 1px $gainsboro;
      margin-right: 23px;
    }

    .product-info {
      width: calc(100% - 180px);
      float: left;
      text-align: left;

      p {
        font-size: 20px;
        font-weight: 700;
        color: $mine-shaft;
        line-height: 28px;
      }

      .price {
        color: $green;
        font-size: 18px;
        display: block;
        padding-bottom: 15px;
        border-bottom: none;
        line-height: 26px;
      }

      button {
        width: auto;
        min-width: 170px;
        height: 52px;

        .material-icons {
          display: none;
        }
      }
    }
  }
}

.new-collection {
  .collection {
    position: relative;
  }

  .VueCarousel-wrapper, .VueCarousel {
    position: inherit;
  }

  .VueCarousel {
    .VueCarousel-navigation {
      position: absolute;
      margin-top: -65px;
      right: 0;
      text-align: right;
      display: block;
      width: 100%;
      top: 0;
      float: left;

      .VueCarousel-navigation-prev, .VueCarousel-navigation-next {
        border: solid 1px $gainsboro;
        padding: 8px;
        margin-right: -8px;
        right: 0;
        top: 0;
        left: inherit;
        background-color: $color-white;
        border-radius: 16px;
        height: 32px;
        color: $green;
        line-height: 32px;
        position: inherit;
        display: flex;
        width: 70px;
        align-items: center;
        justify-content: center;
        float: right;
        transform: inherit;
      }

      .VueCarousel-navigation-prev {
        right: 105px;
      }

      .VueCarousel-navigation-next {
        right: 30px;
      }
    }
  }
}
</style>
