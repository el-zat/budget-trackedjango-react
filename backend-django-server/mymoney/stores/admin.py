from django.contrib import admin
from expenses.models import Category
from .models import (
    GroceryStore,
    Drugstore,
    GasStationStore,
    SportStore,
    ElectronicsStore,
    ClothingStore,
    PetStore,
    HomeStore,
)


class BaseStoreAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'group_label', 'ocr_variants']
    list_filter = ['category']
    search_fields = ['name', 'ocr_variants']
    ordering = ['name']

    store_type_value = None
    default_group_label = None
    default_category_name = None

    def _get_default_category(self):
        if not self.default_category_name:
            return None
        return Category.objects.filter(name=self.default_category_name).first()

    def get_changeform_initial_data(self, request):
        initial = super().get_changeform_initial_data(request)
        default_category = self._get_default_category()
        initial.update({
            'store_type': self.store_type_value,
            'group_label': self.default_group_label,
            'category': default_category.id if default_category else None,
        })
        return initial

    def save_model(self, request, obj, form, change):
        obj.store_type = self.store_type_value
        if not obj.group_label:
            obj.group_label = self.default_group_label
        if not obj.category:
            obj.category = self._get_default_category()
        super().save_model(request, obj, form, change)


@admin.register(GroceryStore)
class GroceryStoreAdmin(BaseStoreAdmin):
    store_type_value = 'grocery'
    default_group_label = 'Supermarket total'


@admin.register(Drugstore)
class DrugstoreAdmin(BaseStoreAdmin):
    store_type_value = 'drugstore'
    default_group_label = 'Drugstore total'


@admin.register(GasStationStore)
class GasStationStoreAdmin(BaseStoreAdmin):
    store_type_value = 'gas_station'
    default_group_label = 'Fuel'
    default_category_name = 'Transport'


@admin.register(SportStore)
class SportStoreAdmin(BaseStoreAdmin):
    store_type_value = 'sports'
    default_group_label = 'Sport total'


@admin.register(ElectronicsStore)
class ElectronicsStoreAdmin(BaseStoreAdmin):
    store_type_value = 'electronics'
    default_group_label = 'Electronics total'


@admin.register(ClothingStore)
class ClothingStoreAdmin(BaseStoreAdmin):
    store_type_value = 'clothing'
    default_group_label = 'Clothing total'


@admin.register(PetStore)
class PetStoreAdmin(BaseStoreAdmin):
    store_type_value = 'pet'
    default_group_label = 'Pet total'


@admin.register(HomeStore)
class HomeStoreAdmin(BaseStoreAdmin):
    store_type_value = 'home'
    default_group_label = 'Home total'
