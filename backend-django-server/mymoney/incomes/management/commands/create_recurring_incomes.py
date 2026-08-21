from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date
from calendar import monthrange
from incomes.models import Income


class Command(BaseCommand):
    help = 'Create recurring income entries for the current month'

    def handle(self, *args, **kwargs):
        today = timezone.now().date()
        
        # Get all recurring incomes
        recurring_incomes = Income.objects.filter(is_recurring=True)
        
        created_count = 0
        
        for income in recurring_incomes:
            # Get the original day from the income's received_date
            original_day = income.received_date.day
            
            # Calculate the target day for current month
            # If the original day doesn't exist in current month (e.g., 31st in February),
            # use the last day of the current month
            last_day_of_current_month = monthrange(today.year, today.month)[1]
            target_day = min(original_day, last_day_of_current_month)
            
            # Create the target date for this month
            target_date = date(today.year, today.month, target_day)
            
            # Check if an entry for this month already exists
            existing_income = Income.objects.filter(
                user=income.user,
                name=income.name,
                amount=income.amount,
                category=income.category,
                received_date__year=today.year,
                received_date__month=today.month,
                received_date__day=target_day
            ).exclude(id=income.id).exists()
            
            if not existing_income:
                # Create new income entry for this month with the same day
                Income.objects.create(
                    user=income.user,
                    name=income.name,
                    description=income.description,
                    amount=income.amount,
                    category=income.category,
                    source=income.source,
                    frequency=income.frequency,
                    is_recurring=False,  # The copy is not recurring, only the original
                    received_date=target_date
                )
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Created recurring income: {income.name} for user {income.user} on day {target_day}'
                    )
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} recurring income entries')
        )
