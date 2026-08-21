from django.contrib import admin
from .models import (
    GroceryStore,
    Drugstore,
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

    def get_changeform_initial_data(self, request):
        initial = super().get_changeform_initial_data(request)
        initial.update({
            'store_type': self.store_type_value,
            'group_label': self.default_group_label,
        })
        return initial

    def save_model(self, request, obj, form, change):
        obj.store_type = self.store_type_value
        if not obj.group_label:
            obj.group_label = self.default_group_label
        super().save_model(request, obj, form, change)


@admin.register(GroceryStore)
class GroceryStoreAdmin(BaseStoreAdmin):
    store_type_value = 'grocery'
    default_group_label = 'Supermarket total'


@admin.register(Drugstore)
class DrugstoreAdmin(BaseStoreAdmin):
    store_type_value = 'drugstore'
    default_group_label = 'Drugstore total'


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
