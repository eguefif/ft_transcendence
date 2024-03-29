# Generated by Django 5.0.1 on 2024-02-26 14:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('userprofile', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='oauth_42_access',
            field=models.CharField(default=''),
        ),
        migrations.AddField(
            model_name='profile',
            name='oauth_42_active',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='profile',
            name='oauth_42_refresh',
            field=models.CharField(default=''),
        ),
    ]
